// auth.js

const { OAuth2Client } = require("google-auth-library");
const User = require("./models/User");

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Check if Google credential was received
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Get Google account information
        const payload = ticket.getPayload();

        const {
            sub: googleId,
            name,
            email,
            picture
        } = payload;

        // Find existing user
        let user = await User.findOne({ email });

        // Create new user if not found
        if (!user) {
            user = await User.create({
                googleId,
                name,
                email,
                profilePicture: picture || ""
            });
        } else {
            // Update Google information
            user.googleId = googleId;
            user.name = name;
            user.profilePicture = picture || user.profilePicture;

            await user.save();
        }

        // Send user information
        res.status(200).json({
            success: true,
            message: "Google login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error("Google login error:", error.message);

        res.status(401).json({
            success: false,
            message: "Invalid Google login"
        });
    }
};

// ==========================================
// GET USER PROFILE
// ==========================================

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
};

// ==========================================
// UPDATE USER PROFILE
// ==========================================

const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            preferences
        } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update name
        if (name) {
            user.name = name;
        }

        // Update preferences
        if (preferences) {
            user.preferences = {
                ...user.preferences.toObject(),
                ...preferences
            };
        }

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    googleLogin,
    getUserProfile,
    updateUserProfile
};