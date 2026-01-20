import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Edit,
  Save,
  X,
  FileImage,
  ExternalLink,
  Filter,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { adminAPI } from "@/services/api";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
  });

  const [editingReport, setEditingReport] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    priority: "",
    note: "",
  });

  const [adminProofFiles, setAdminProofFiles] = useState([]);
  const [adminProofPreview, setAdminProofPreview] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  /* =========================
     FETCH REPORTS
  ========================= */
  const fetchReports = async () => {
    try {
      setLoading(true);

      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;

      const res = await adminAPI.getAllIncidents(params);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch reports:", err);
      alert("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EDIT HANDLERS
  ========================= */
  const handleEdit = (report) => {
    setEditingReport(report._id);
    setUpdateData({
      status: report.status,
      priority: report.priority,
      note: "",
    });
    setAdminProofFiles([]);
    setAdminProofPreview([]);
  };

  const handleProofSelect = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setAdminProofFiles(files);

    const previews = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
    }));
    setAdminProofPreview(previews);
  };

  const removeProofFile = (index) => {
    setAdminProofFiles((f) => f.filter((_, i) => i !== index));
    setAdminProofPreview((p) => p.filter((_, i) => i !== index));
  };

  /* =========================
     UPDATE REPORT
  ========================= */
  const handleUpdate = async () => {
    try {
      if (adminProofFiles.length > 0) {
        const formData = new FormData();
        formData.append("status", updateData.status);
        formData.append("priority", updateData.priority);
        formData.append("note", updateData.note);
        adminProofFiles.forEach((f) => formData.append("attachments", f));

        await adminAPI.updateIncident(editingReport, formData);
      } else {
        await adminAPI.updateIncident(editingReport, updateData);
      }

      alert("Report updated successfully");
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update report");
    }
  };

  /* =========================
     HELPERS
  ========================= */
  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border";
    if (status === "Resolved")
      return `${base} bg-green-50 text-green-800 border-green-200`;
    if (status === "In Review")
      return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
    if (status === "Closed")
      return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    return `${base} bg-blue-50 text-blue-800 border-blue-200`;
  };

  const getPriorityBadge = (priority) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border";
    if (priority === "Critical")
      return `${base} bg-red-50 text-red-800 border-red-200`;
    if (priority === "High")
      return `${base} bg-orange-50 text-orange-800 border-orange-200`;
    if (priority === "Low")
      return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    return `${base} bg-indigo-50 text-indigo-800 border-indigo-200`;
  };

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const filteredReports = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return reports.filter(
      (r) =>
        (r.title || "").toLowerCase().includes(q) ||
        (r.referenceId || "").toLowerCase().includes(q)
    );
  }, [reports, searchTerm]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-[#f7f3ea] p-6">
      <h1 className="text-2xl font-extrabold mb-4">
        Reports Register (Admin)
      </h1>

      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p>No reports found</p>
      ) : (
        filteredReports.map((report) => (
          <div
            key={report._id}
            className="bg-white border rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="font-extrabold">{report.title}</h2>
                <p className="text-sm text-gray-600">
                  {report.referenceId}
                </p>
              </div>

              {editingReport !== report._id && (
                <button
                  onClick={() => handleEdit(report)}
                  className="text-blue-700 font-bold"
                >
                  <Edit size={16} /> Edit
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <span className={getStatusBadge(report.status)}>
                {report.status}
              </span>
              <span className={getPriorityBadge(report.priority)}>
                {report.priority}
              </span>
            </div>

            {editingReport === report._id && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <select
                  value={updateData.status}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value })
                  }
                >
                  <option>Pending</option>
                  <option>In Review</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>

                <select
                  value={updateData.priority}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>

                <textarea
                  value={updateData.note}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, note: e.target.value })
                  }
                  placeholder="Admin note"
                />

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProofSelect}
                />

                <button
                  onClick={handleUpdate}
                  className="bg-blue-700 text-white px-4 py-2 mt-2 rounded"
                >
                  <Save size={16} /> Save
                </button>

                <button
                  onClick={() => setEditingReport(null)}
                  className="ml-2 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ManageReports;
