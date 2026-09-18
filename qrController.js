const QRCode = require('../models/QRCode');

// POST /api/qr
// Save a QR code the user just generated on the frontend
exports.createQR = async (req, res) => {
  try {
    const { type, content, foregroundColor, backgroundColor, qrStyle, logo } = req.body;

    if (!type || !content) {
      return res.status(400).json({ message: 'type and content are required' });
    }

    const qr = await QRCode.create({
      userId: req.user.id,
      type,
      content,
      foregroundColor,
      backgroundColor,
      qrStyle,
      logo
    });

    res.status(201).json({ qr });
  } catch (err) {
    console.error('Create QR error:', err.message);
    res.status(500).json({ message: 'Could not save QR code' });
  }
};

// GET /api/qr
// Every QR code belonging to the logged-in user, newest first
exports.getUserQRs = async (req, res) => {
  try {
    const qrs = await QRCode.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ qrs });
  } catch (err) {
    console.error('Get user QRs error:', err.message);
    res.status(500).json({ message: 'Could not fetch QR codes' });
  }
};

// GET /api/qr/:id
exports.getQRById = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);

    if (!qr) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    if (qr.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this QR code' });
    }

    res.status(200).json({ qr });
  } catch (err) {
    console.error('Get QR by id error:', err.message);
    res.status(500).json({ message: 'Could not fetch QR code' });
  }
};

// PUT /api/qr/:id
// Update styling or content on an existing QR code
exports.updateQR = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);

    if (!qr) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    if (qr.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this QR code' });
    }

    const { content, foregroundColor, backgroundColor, qrStyle, logo } = req.body;
    if (content !== undefined) qr.content = content;
    if (foregroundColor !== undefined) qr.foregroundColor = foregroundColor;
    if (backgroundColor !== undefined) qr.backgroundColor = backgroundColor;
    if (qrStyle !== undefined) qr.qrStyle = qrStyle;
    if (logo !== undefined) qr.logo = logo;

    await qr.save();
    res.status(200).json({ qr });
  } catch (err) {
    console.error('Update QR error:', err.message);
    res.status(500).json({ message: 'Could not update QR code' });
  }
};

// DELETE /api/qr/:id
exports.deleteQR = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id);

    if (!qr) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    if (qr.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this QR code' });
    }

    await qr.deleteOne();
    res.status(200).json({ message: 'QR code deleted' });
  } catch (err) {
    console.error('Delete QR error:', err.message);
    res.status(500).json({ message: 'Could not delete QR code' });
  }
};