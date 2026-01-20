// 🔥 MUST BE FIRST LINE
import "./config/loadenv.js";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";
import adminRoutes from "./routes/admin.js";
import awarenessRoutes from "./routes/awareness.js";

import fs from "fs";

// ======================
// 🔌 CONNECT DB
// ======================
connectDB();

// ======================
// 🚀 APP INIT
// ======================
const app = express();
app.set("trust proxy", 1);

// ======================
// 🌐 CORS CONFIG (PRODUCTION SAFE)
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined/null

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false
      );
    },
    credentials: true,
  })
);

// ======================
// 🌐 BODY PARSERS
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// 🧪 HEALTH CHECKS
// ======================
app.get("/", (req, res) => {
  res.send("✅ Sentra API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ======================
// 📁 UPLOADS FOLDER
// ======================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}
app.use("/uploads", express.static("uploads"));

// ======================
// 🧪 DEBUG (KEEP)
// ======================
console.log("Cloudinary ENV:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// ======================
// 🛣 ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/awareness", awarenessRoutes);

// ======================
// ❌ GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// ======================
// ▶ START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
