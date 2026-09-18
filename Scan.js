// models/Scan.js

const mongoose = require("mongoose");

// Scan Schema
const scanSchema = new mongoose.Schema(
    {
        // User who scanned the QR code
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        // Scanned QR result/content
        result: {
            type: String,
            required: true,
            trim: true
        },

        // Type of scanned content
        type: {
            type: String,
            default: "text"
        },

        // Device used for scanning
        device: {
            type: String,
            default: "Unknown"
        },

        // Browser information
        browser: {
            type: String,
            default: "Unknown"
        },

        // Operating system
        operatingSystem: {
            type: String,
            default: "Unknown"
        }
    },
    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }
);

// Export Scan model
module.exports = mongoose.model("Scan", scanSchema);