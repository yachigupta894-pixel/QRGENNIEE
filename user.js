// models/User.js

const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema(
    {
        // User's Google account ID
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        // User's name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // User's email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Profile picture from Google
        profilePicture: {
            type: String,
            default: ""
        },

        // User preferences
        preferences: {
            darkMode: {
                type: Boolean,
                default: false
            },

            saveHistory: {
                type: Boolean,
                default: true
            },

            autoDownload: {
                type: Boolean,
                default: false
            },

            language: {
                type: String,
                default: "English"
            },

            defaultQRSize: {
                type: Number,
                default: 300
            },

            errorCorrection: {
                type: String,
                default: "M"
            },

            qrColor: {
                type: String,
                default: "#000000"
            },

            bgColor: {
                type: String,
                default: "#ffffff"
            }
        }
    },
    {
        // Automatically creates createdAt and updatedAt
        timestamps: true
    }
);

// Export User model
module.exports = mongoose.model("User", userSchema);