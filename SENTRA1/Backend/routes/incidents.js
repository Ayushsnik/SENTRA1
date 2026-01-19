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
   ⭐ FIXED: Proper file upload handling
========================= */
router.post(
 "/",
  (req, res, next) => {
    upload.array("attachments", 5)(req, res, (err) => {
      if (err) {
        console.error("❌ MULTER ERROR:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        
        return res.status(400).json({
          message: "File upload failed",
          error: err.message,
          details: err.toString()
        });
      }
      
      console.log("✅ Multer processed successfully");
      console.log("Files:", req.files?.length || 0);
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
    // Validate request
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

      console.log("📝 Creating incident:", title);
      console.log("📎 Files received:", req.files?.length || 0);

      // ✅ Process Cloudinary uploads
      const attachments = Array.isArray(req.files)
        ? req.files.map((file) => {
            console.log("🖼️ Cloudinary URL:", file.path);
            return {
              filename: file.originalname || "attachment",
              path: file.path, // Cloudinary secure URL
            };
          })
        : [];

      console.log("✅ Attachments processed:", attachments.length);

      // Build incident data
      const incidentData = {
        title,
        category,
        description,
        location,
        incidentDate,
        witnesses,
        isAnonymous: isAnonymous === "true" || isAnonymous === true,
        anonymousContact: isAnonymous === "true" ? anonymousContact : undefined,
        attachments, // ⭐ CRITICAL: Include attachments
      };

      // 🔐 Attach user if NOT anonymous
      if (isAnonymous !== "true" && isAnonymous !== true) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            incidentData.reportedBy = decoded.id;
            console.log("✅ User attached:", decoded.id);
          } catch (err) {
            console.log("⚠️ Token verification failed, proceeding as anonymous");
            incidentData.isAnonymous = true;
          }
        } else {
          console.log("⚠️ No auth header, proceeding as anonymous");
          incidentData.isAnonymous = true;
        }
      }

      // Create incident in database
      const incident = await Incident.create(incidentData);

      console.log("✅ Incident created:", incident._id);
      console.log("📎 Attachments saved:", incident.attachments?.length || 0);
      console.log("🔗 Reference ID:", incident.referenceId);

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
   GET /api/incidents/my-reports
   Get current user's reports
========================= */
router.get("/my-reports", protect, async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${incidents.length} reports for user ${req.user._id}`);
    res.json(incidents);
  } catch (err) {
    console.error("❌ Error fetching user reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   GET /api/incidents/:id
   Get single incident by ID
========================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("reportedBy", "name email");

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