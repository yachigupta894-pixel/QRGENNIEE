// server.js

// ===============================
// IMPORT REQUIRED PACKAGES
// ===============================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./db");

// Create Express application
const app = express();

// Render provides PORT through environment variables
const PORT = process.env.PORT || 5000;


// ===============================
// MIDDLEWARE
// ===============================

// Allow frontend to communicate with backend
app.use(cors());

// Accept JSON data
app.use(express.json());

// Accept form data
app.use(express.urlencoded({ extended: true }));


// ===============================
// SERVE FRONTEND
// ===============================

// Frontend files are inside the public folder
app.use(express.static(path.join(__dirname, "public")));


// ===============================
// TEST ROUTE
// ===============================

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "QR Genie API is running 🚀"
  });
});


// ===============================
// QR HISTORY ROUTES
// ===============================

// Get all QR history
app.get("/api/history", async (req, res) => {
  try {
    const QRHistory = require("./models/QRHistory");

    const history = await QRHistory.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error("Fetch QR history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch QR history"
    });
  }
});


// Save generated QR
app.post("/api/history", async (req, res) => {
  try {
    const QRHistory = require("./models/QRHistory");

    const {
      content,
      type,
      size,
      qrColor,
      bgColor
    } = req.body;

    const newQR = new QRHistory({
      content,
      type,
      size,
      qrColor,
      bgColor
    });

    const savedQR = await newQR.save();

    res.status(201).json({
      success: true,
      message: "QR saved successfully",
      data: savedQR
    });

  } catch (error) {
    console.error("Save QR error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save QR"
    });
  }
});


// Delete QR history item
app.delete("/api/history/:id", async (req, res) => {
  try {
    const QRHistory = require("./models/QRHistory");

    await QRHistory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "QR history deleted"
    });

  } catch (error) {
    console.error("Delete QR history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete history"
    });
  }
});


// Delete complete QR history
app.delete("/api/history", async (req, res) => {
  try {
    const QRHistory = require("./models/QRHistory");

    await QRHistory.deleteMany({});

    res.json({
      success: true,
      message: "All QR history deleted"
    });

  } catch (error) {
    console.error("Delete all QR history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete history"
    });
  }
});


// ===============================
// SCAN HISTORY ROUTES
// ===============================

// Get scan history
app.get("/api/scans", async (req, res) => {
  try {
    const ScanHistory = require("./models/ScanHistory");

    const scans = await ScanHistory.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      data: scans
    });

  } catch (error) {
    console.error("Fetch scan history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch scan history"
    });
  }
});


// Save scanned QR
app.post("/api/scans", async (req, res) => {
  try {
    const ScanHistory = require("./models/ScanHistory");

    const {
      result,
      type,
      device
    } = req.body;

    const newScan = new ScanHistory({
      result,
      type,
      device
    });

    const savedScan = await newScan.save();

    res.status(201).json({
      success: true,
      message: "Scan saved successfully",
      data: savedScan
    });

  } catch (error) {
    console.error("Save scan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save scan"
    });
  }
});


// Delete scan history item
app.delete("/api/scans/:id", async (req, res) => {
  try {
    const ScanHistory = require("./models/ScanHistory");

    await ScanHistory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Scan deleted"
    });

  } catch (error) {
    console.error("Delete scan error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete scan"
    });
  }
});


// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/api/stats", async (req, res) => {
  try {
    const QRHistory = require("./models/QRHistory");
    const ScanHistory = require("./models/ScanHistory");

    const totalQRs = await QRHistory.countDocuments();
    const totalScans = await ScanHistory.countDocuments();

    res.json({
      success: true,
      data: {
        totalQRs,
        totalScans
      }
    });

  } catch (error) {
    console.error("Statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
});


// ===============================
// FRONTEND ROUTE
// ===============================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


// ===============================
// CONNECT DATABASE + START SERVER
// ===============================

connectDB()
  .then(() => {

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `QR Genie server running on port ${PORT}`
      );
    });

  })
  .catch((error) => {

    console.error(
      "Failed to connect to MongoDB:",
      error.message
    );

    process.exit(1);
  });