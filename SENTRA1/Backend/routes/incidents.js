import express from "express";
import { body, validationResult } from "express-validator";
import Incident from "../models/Incident.js";
import { protect } from "../middleware/auth.js";
import upload from "../config/multerCloudinary.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* =========================
   POST /api/incidents
   Create incident (anonymous OR logged-in)
========================= */
router.post(
  "/",
  (req, res, next) => {
    upload.array("attachments", 5)(req, res, (err) => {
      if (err) {
        console.error("❌ MULTER ERROR:", err);
        return res.status(400).json({
          message: "File upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("incidentDate").notEmpty().withMessage("Incident date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        category,
        description,
        location,
        incidentDate,
        witnesses,
        isAnonymous,
        anonymousContact,
      } = req.body;

      const attachments = Array.isArray(req.files)
        ? req.files.map((file) => ({
            filename: file.originalname || "attachment",
            path: file.path,
          }))
        : [];

      const incidentData = {
        title,
        category,
        description,
        location,
        incidentDate,
        witnesses,
        isAnonymous: isAnonymous === "true" || isAnonymous === true,
        anonymousContact:
          isAnonymous === "true" ? anonymousContact : undefined,
        attachments,
      };

      // Attach user if NOT anonymous
      if (incidentData.isAnonymous === false) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            incidentData.reportedBy = decoded.id;
          } catch {
            incidentData.isAnonymous = true;
          }
        } else {
          incidentData.isAnonymous = true;
        }
      }

      const incident = await Incident.create(incidentData);

      res.status(201).json({
        message: "Incident reported successfully",
        incident,
      });
    } catch (err) {
      console.error("❌ INCIDENT CREATE ERROR:", err);
      res.status(500).json({
        message: "Failed to submit incident",
        error: err.message,
      });
    }
  }
);

/* =========================
   GET /api/incidents/my
   Get logged-in user's reports
   ✅ FIXED ROUTE
========================= */
router.get("/my", protect, async (req, res) => {
  try {
    const incidents = await Incident.find({
      reportedBy: req.user.id,
    }).sort({ createdAt: -1 });

    console.log(
      `✅ Fetched ${incidents.length} reports for user ${req.user.id}`
    );

    res.json(incidents);
  } catch (err) {
    console.error("❌ Error fetching user reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   GET /api/incidents/:id
   Get single incident
========================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (err) {
    console.error("❌ Error fetching incident:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;