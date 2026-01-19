import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return !this.isAnonymous;
    },
  },

  isAnonymous: {
    type: Boolean,
    default: false,
  },

  anonymousContact: {
    type: String,
  },

  title: {
    type: String,
    required: [true, "Incident title is required"],
    trim: true,
  },

  category: {
    type: String,
    required: [true, "Category is required"],
    enum: [
      "Harassment",
      "Bullying",
      "Discrimination",
      "Safety Concern",
      "Academic Misconduct",
      "Substance Abuse",
      "Mental Health",
      "Physical Violence",
      "Theft",
      "Other",
    ],
  },

  description: {
    type: String,
    required: [true, "Description is required"],
  },

  location: {
    type: String,
  },

  incidentDate: {
    type: Date,
    required: [true, "Incident date is required"],
  },

  witnesses: {
    type: String,
  },

  // ✅ User uploaded attachments
  attachments: [
    {
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // ✅ Admin uploaded proof (action taken evidence)
  adminProof: [
    {
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  status: {
    type: String,
    enum: ["Pending", "In Review", "Resolved", "Closed"],
    default: "Pending",
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  adminNotes: [
    {
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // keep it (optional)
  resolution: {
    type: String,
  },

  resolvedAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/* =========================
   AUTO-GENERATE REFERENCE ID
   (pre('validate'))
========================= */
incidentSchema.pre("validate", async function (next) {
  if (!this.referenceId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const count = await mongoose.model("Incident").countDocuments();
    this.referenceId = `INC-${year}${month}-${String(count + 1).padStart(
      5,
      "0"
    )}`;
  }

  this.updatedAt = Date.now();
  next();
});

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
