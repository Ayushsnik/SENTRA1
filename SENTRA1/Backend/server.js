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
// 🌐 CORS (VERCEL SAFE)
// ======================
const allowedOrigins = [
  "http://localhost:5173",          // local dev
  process.env.FRONTEND_URL,         // vercel prod
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / curl / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ======================
// 🌐 BODY PARSERS
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// 🧪 HEALTH
// ======================
app.get("/", (req, res) => {
  res.send("✅ Sentra API is running");
});

// ======================
// 📁 UPLOADS
// ======================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}
app.use("/uploads", express.static("uploads"));

// ======================
// 🛣 ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/awareness", awarenessRoutes);

// ======================
// ❌ ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

// ======================
// ▶ START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
