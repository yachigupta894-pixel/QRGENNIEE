const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const authMiddleware = require('../middleware/authMiddleware');

// All QR routes require a logged-in user
router.use(authMiddleware);

// POST /api/qr
// Save a newly generated QR code (type, content, colors, style, logo) for the logged-in user
router.post('/', qrController.createQR);

// GET /api/qr
// Get every QR code the logged-in user has created
router.get('/', qrController.getUserQRs);

// GET /api/qr/:id
// Get a single QR code by its id
router.get('/:id', qrController.getQRById);

// PUT /api/qr/:id
// Update an existing QR code's colors, style, or content
router.put('/:id', qrController.updateQR);

// DELETE /api/qr/:id
// Delete a QR code
router.delete('/:id', qrController.deleteQR);

module.exports = router;