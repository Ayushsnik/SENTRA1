import express from "express";
import Incident from "../models/Incident.js";
import { protect, admin } from "../middleware/auth.js";
import upload from "../config/multerCloudinary.js";

const router = express.Router();

/* =========================
   GET ALL INCIDENTS WITH FILTERS
   ⭐ UPDATED to match ManageReports
========================= */
router.get("/incidents", protect, admin, async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const incidents = await Incident.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Admin: Fetched ${incidents.length} incidents`);
    console.log(`📎 Sample attachments:`, incidents[0]?.attachments?.length || 0);

    res.json(incidents);
  } catch (err) {
    console.error("❌ Error fetching incidents:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   UPDATE INCIDENT (PATCH)
   ✅ Supports:
   - status, priority
   - admin note
   - admin proof image upload (Cloudinary)
========================= */
router.patch(
  "/incidents/:id",
  protect,
  admin,
  (req, res, next) => {
    // Admin uploads proof images using same field name "attachments"
    upload.array("attachments", 5)(req, res, (err) => {
      if (err) {
        console.error("UPLOAD ERROR:", err);
        return res.status(400).json({
          message: "File upload failed",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { status, priority, note } = req.body;

      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      // ✅ Update fields
      if (status) incident.status = status;
      if (priority) incident.priority = priority;

      // ✅ Admin note
      if (note) {
        incident.adminNotes.push({
          note,
          addedBy: req.user._id,
          addedAt: new Date(),
        });
      }

      // ✅ Admin proof uploads (Cloudinary URLs)
      const proofUploads = Array.isArray(req.files)
        ? req.files.map((file) => ({
            filename: file.originalname || "admin-proof",
            path: file.path, // Cloudinary secure URL
            uploadedAt: new Date(),
          }))
        : [];

      if (proofUploads.length > 0) {
        // Ensure field exists
        incident.adminProof = incident.adminProof || [];
        incident.adminProof.push(...proofUploads);
      }

      // ✅ If resolved, set resolvedAt
      if (status === "Resolved") {
        incident.resolvedAt = Date.now();
      }

      await incident.save();

      const updatedIncident = await Incident.findById(incident._id).populate(
        "reportedBy",
        "name email"
      );

      console.log(`✅ Admin: Updated incident ${updatedIncident._id}`);
      res.json(updatedIncident);
    } catch (err) {
      console.error("❌ Error updating incident:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   LEGACY ROUTES (Keep for backwards compatibility)
========================= */
router.get("/reports", protect, admin, async (req, res) => {
  const incidents = await Incident.find()
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });
  res.json(incidents);
});

router.put("/reports/:id/status", protect, admin, async (req, res) => {
  const { status } = req.body;
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    return res.status(404).json({ message: "Incident not found" });
  }

  incident.status = status;
  await incident.save();
  res.json(incident);
});

router.put("/reports/:id", protect, admin, async (req, res) => {
  const { title, description } = req.body;
  const incident = await Incident.findByIdAndUpdate(
    req.params.id,
    { title, description },
    { new: true }
  );
  res.json(incident);
});

/* =========================
   ANALYTICS
========================= */
router.get("/analytics", protect, admin, async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: "Pending" });
    const inReview = await Incident.countDocuments({ status: "In Review" });
    const resolved = await Incident.countDocuments({ status: "Resolved" });

    const categoryStats = await Incident.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const priorityStats = await Incident.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title referenceId category status priority createdAt");

    res.json({
      summary: { total, pending, inReview, resolved },
      categoryStats,
      priorityStats,
      recentIncidents,
    });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
