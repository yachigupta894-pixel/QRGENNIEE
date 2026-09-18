// models/QRCODE.js

const mongoose = require("mongoose");

// QR Code Schema
const qrCodeSchema = new mongoose.Schema(
    {
        // User who generated the QR code
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        // QR code content
        content: {
            type: String,
            required: true,
            trim: true
        },

        // Type of QR code
        type: {
            type: String,
            default: "text"
        },

        // QR code size
        size: {
            type: Number,
            default: 300
        },

        // QR code foreground color
        qrColor: {
            type: String,
            default: "#000000"
        },

        // QR code background color
        bgColor: {
            type: String,
            default: "#ffffff"
        },

        // Error correction level
        errorCorrection: {
            type: String,
            enum: ["L", "M", "Q", "H"],
            default: "M"
        },

        // Whether logo was included
        includeLogo: {
            type: Boolean,
            default: false
        },

        // Number of times this QR was scanned
        scanCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Export model
module.exports = mongoose.model("QRCode", qrCodeSchema);