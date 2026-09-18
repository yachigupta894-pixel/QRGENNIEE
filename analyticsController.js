// backend/controllers/analyticsController.js
//
// Powers analytics.html: overview numbers, a scans-over-time series,
// which QR codes get scanned most, and what devices scan them.
//
// Assumes (same as historyController.js):
//   - authMiddleware.js runs first and sets req.user.id
//   - models/QRCode.js exports a Mongoose model: userId, type, content,
//     foregroundColor, backgroundColor, qrStyle, logo, createdAt
//   - models/Scan.js   exports a Mongoose model: qrId, userId, content,
//     type, scannedAt, device
//
// All queries are scoped to req.user.id — one user never sees another's
// numbers.

const mongoose = require('mongoose');
const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');

const DAY_MS = 24 * 60 * 60 * 1000;

// Turn a ?range= query param into a start date. Defaults to 30 days.
function rangeToStart(range) {
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range] || 30;
  return new Date(Date.now() - days * DAY_MS);
}

/* ------------------------------------------------------------------ */
/*  Overview — the headline numbers                                    */
/* ------------------------------------------------------------------ */

// GET /api/analytics/overview
// Totals plus how many scans happened today and in the last 7 days.
exports.getOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);

    const [totalQRCodes, totalScans, scansToday, scansThisWeek] = await Promise.all([
      QRCode.countDocuments({ userId }),
      Scan.countDocuments({ userId }),
      Scan.countDocuments({ userId, scannedAt: { $gte: startOfToday } }),
      Scan.countDocuments({ userId, scannedAt: { $gte: sevenDaysAgo } })
    ]);

    res.json({ totalQRCodes, totalScans, scansToday, scansThisWeek });
  } catch (err) {
    console.error('getOverview error:', err);
    res.status(500).json({ message: 'Could not load your analytics overview.' });
  }
};

/* ------------------------------------------------------------------ */
/*  Scans over time — for a line/bar chart                             */
/* ------------------------------------------------------------------ */

// GET /api/analytics/scans-over-time?range=7d|30d|90d
// One point per day, zero-filled so the chart has no gaps.
exports.getScansOverTime = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const start = rangeToStart(req.query.range);
    start.setHours(0, 0, 0, 0);

    const rows = await Scan.aggregate([
      { $match: { userId, scannedAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    const countByDay = new Map(rows.map(r => [r._id, r.count]));

    // Zero-fill every day in the range so the frontend doesn't have to
    const series = [];
    for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: countByDay.get(key) || 0 });
    }

    res.json({ series });
  } catch (err) {
    console.error('getScansOverTime error:', err);
    res.status(500).json({ message: 'Could not load scan trends.' });
  }
};

/* ------------------------------------------------------------------ */
/*  Top QR codes — which saved codes get scanned most                  */
/* ------------------------------------------------------------------ */

// GET /api/analytics/top-codes?limit=5
// Ranks the user's saved QR codes by how many scans reference their qrId.
// Codes with zero scans are left out (a Scan doc only exists if it happened).
exports.getTopCodes = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

    const rows = await Scan.aggregate([
      { $match: { userId, qrId: { $ne: null } } },
      { $group: { _id: '$qrId', scanCount: { $sum: 1 }, lastScannedAt: { $max: '$scannedAt' } } },
      { $sort: { scanCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'qrcodes', // Mongoose lowercases + pluralizes the "QRCode" model name
          localField: '_id',
          foreignField: '_id',
          as: 'qrCode'
        }
      },
      { $unwind: '$qrCode' },
      {
        $project: {
          _id: 0,
          qrId: '$_id',
          scanCount: 1,
          lastScannedAt: 1,
          type: '$qrCode.type',
          content: '$qrCode.content',
          createdAt: '$qrCode.createdAt'
        }
      }
    ]);

    res.json({ items: rows });
  } catch (err) {
    console.error('getTopCodes error:', err);
    res.status(500).json({ message: 'Could not load your top QR codes.' });
  }
};

/* ------------------------------------------------------------------ */
/*  Device breakdown — what's doing the scanning                       */
/* ------------------------------------------------------------------ */

// GET /api/analytics/devices
// Buckets the free-text `device` (usually a user-agent string) into
// coarse categories so the frontend can draw a simple breakdown chart.
exports.getDeviceBreakdown = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const rows = await Scan.aggregate([
      { $match: { userId } },
      {
        $project: {
          category: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$device', regex: /iphone|ipad|android/i } }, then: 'Mobile' },
                { case: { $regexMatch: { input: '$device', regex: /tablet/i } }, then: 'Tablet' },
                { case: { $regexMatch: { input: '$device', regex: /windows|macintosh|linux/i } }, then: 'Desktop' }
              ],
              default: 'Other'
            }
          }
        }
      },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      items: rows.map(r => ({ category: r._id, count: r.count }))
    });
  } catch (err) {
    console.error('getDeviceBreakdown error:', err);
    res.status(500).json({ message: 'Could not load your device breakdown.' });
  }
};