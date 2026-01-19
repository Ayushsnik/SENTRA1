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

  // ✅ Admin proof upload
  const [adminProofFiles, setAdminProofFiles] = useState([]);
  const [adminProofPreview, setAdminProofPreview] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/incidents?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Failed to fetch reports:", error);
      alert("Failed to fetch reports: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report._id);

    setUpdateData({
      status: report.status,
      priority: report.priority,
      note: "",
    });

    // reset admin proof state when switching edit
    setAdminProofFiles([]);
    setAdminProofPreview([]);
  };

  const handleProofSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // limit (optional)
    const allowed = files.slice(0, 5);

    setAdminProofFiles(allowed);

    // previews
    const previews = allowed.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
    }));

    setAdminProofPreview(previews);
  };

  const removeProofFile = (index) => {
    const newFiles = [...adminProofFiles];
    const newPrev = [...adminProofPreview];

    newFiles.splice(index, 1);
    newPrev.splice(index, 1);

    setAdminProofFiles(newFiles);
    setAdminProofPreview(newPrev);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ If admin selected proof files, send multipart/form-data
      // Otherwise send JSON like before
      let response;

      if (adminProofFiles.length > 0) {
        const formData = new FormData();
        formData.append("status", updateData.status);
        formData.append("priority", updateData.priority);
        formData.append("note", updateData.note);

        // proof files
        adminProofFiles.forEach((file) => {
          formData.append("attachments", file); // same field name like user side
        });

        response = await fetch(
          `http://localhost:5000/api/admin/incidents/${editingReport}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              // ❌ do not set content-type for formdata
            },
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `http://localhost:5000/api/admin/incidents/${editingReport}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );
      }

      if (!response.ok) throw new Error("Failed to update report");

      alert("Report updated successfully");
      setEditingReport(null);
      fetchReports();
    } catch (error) {
      console.error("❌ Failed to update:", error);
      alert("Failed to update report");
    }
  };

  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border";
    if (status === "Resolved")
      return `${base} bg-green-50 text-green-800 border-green-200`;
    if (status === "In Review")
      return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
    if (status === "Closed")
      return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    return `${base} bg-blue-50 text-blue-800 border-blue-200`; // Pending
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
    return `${base} bg-indigo-50 text-indigo-800 border-indigo-200`; // Medium
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const title = (report.title || "").toLowerCase();
      const ref = (report.referenceId || "").toLowerCase();
      const q = searchTerm.toLowerCase();
      return title.includes(q) || ref.includes(q);
    });
  }, [reports, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[#eee3d3] bg-[#fbf7ee]">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Reports Register (Admin)
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Search, filter, review attachments and update incident status &
              priority.
            </p>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-6">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by Title or Reference ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#e8dfcf] rounded-md bg-[#fffdf7] focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-[#e8dfcf] rounded-md bg-[#fffdf7] focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({ ...filters, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-[#e8dfcf] rounded-md bg-[#fffdf7] focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-2 text-gray-600 text-sm font-semibold">
                <Filter size={16} />
                Filters
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[#eee3d3] bg-[#fbf7ee] flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">
              Total Records:{" "}
              <span className="text-blue-800">{filteredReports.length}</span>
            </p>
            <p className="text-xs text-gray-600">
              Tip: Click “Edit” to update status/priority and upload proof of
              action.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-700 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-14 text-gray-600">
              No reports found
            </div>
          ) : (
            <div className="divide-y divide-[#f0e6d8]">
              {filteredReports.map((report) => (
                <div key={report._id} className="px-6 py-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    {/* LEFT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-extrabold text-gray-900 truncate">
                            {report.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs font-bold px-2 py-1 rounded border border-[#e8dfcf] bg-[#fbf7ee] text-gray-800">
                              {report.referenceId}
                            </span>

                            <span className="text-xs font-bold px-2 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-800">
                              {report.category}
                            </span>

                            <span className={getStatusBadge(report.status)}>
                              {report.status}
                            </span>

                            <span className={getPriorityBadge(report.priority)}>
                              {report.priority}
                            </span>
                          </div>
                        </div>

                        {editingReport !== report._id && (
                          <button
                            onClick={() => handleEdit(report)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition text-sm font-bold"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm text-gray-700">
                        <div className="bg-[#fbf7ee] border border-[#e8dfcf] rounded-md px-3 py-2">
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            Incident Date
                          </p>
                          <p className="font-semibold">
                            {formatDate(report.incidentDate)}
                          </p>
                        </div>

                        <div className="bg-[#fbf7ee] border border-[#e8dfcf] rounded-md px-3 py-2">
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            Location
                          </p>
                          <p className="font-semibold">
                            {report.location || "N/A"}
                          </p>
                        </div>

                        <div className="bg-[#fbf7ee] border border-[#e8dfcf] rounded-md px-3 py-2">
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            Submitted On
                          </p>
                          <p className="font-semibold">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>

                        <div className="bg-[#fbf7ee] border border-[#e8dfcf] rounded-md px-3 py-2">
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            Reporter
                          </p>
                          <p className="font-semibold">
                            {report.isAnonymous
                              ? "Anonymous"
                              : report?.reportedBy?.name || "User"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                          Description
                        </p>
                        <p className="text-gray-800 mt-1 leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: USER ATTACHMENTS */}
                    <div className="w-full lg:w-[360px]">
                      <div className="border border-[#e8dfcf] bg-[#fbf7ee] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileImage size={16} className="text-gray-700" />
                          <p className="text-sm font-extrabold text-gray-900">
                            User Attachments
                          </p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#e8dfcf] text-gray-800">
                            {report.attachments?.length || 0}
                          </span>
                        </div>

                        {!report.attachments || report.attachments.length === 0 ? (
                          <div className="text-sm text-gray-600 bg-white border border-dashed border-[#e8dfcf] rounded-md p-3">
                            No attachments uploaded
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {report.attachments.slice(0, 6).map((att, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedImage(att.path)}
                                className="group relative rounded-md overflow-hidden border border-[#e8dfcf] bg-white"
                                title={att.filename}
                              >
                                <img
                                  src={att.path}
                                  alt={att.filename}
                                  className="w-full h-20 object-cover group-hover:opacity-90 transition"
                                  onError={(e) => {
                                    e.target.src =
                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect fill="%23eee" width="120" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EDIT MODE */}
                  {editingReport === report._id && (
                    <div className="mt-6 border border-blue-200 bg-blue-50/50 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-extrabold text-blue-900">
                          Administrative Update Form
                        </p>
                        <button
                          onClick={() => setEditingReport(null)}
                          className="text-blue-900 hover:text-blue-700 transition"
                          title="Close"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                            Status
                          </label>
                          <select
                            value={updateData.status}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Review">In Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                            Priority
                          </label>
                          <select
                            value={updateData.priority}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                priority: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        {/* Admin Note */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                            Admin Note
                          </label>
                          <textarea
                            value={updateData.note}
                            onChange={(e) =>
                              setUpdateData({
                                ...updateData,
                                note: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={4}
                            placeholder="Write a note for internal tracking..."
                          />
                        </div>

                        {/* ✅ Proof Upload (replaces Resolution) */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                            Action Proof Upload (Admin)
                          </label>

                          <div className="border border-blue-200 bg-white rounded-md p-3">
                            <div className="flex items-center justify-between gap-3">
                              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-700 text-white font-bold cursor-pointer hover:bg-blue-800 transition text-sm">
                                <UploadCloud size={16} />
                                Upload Images
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={handleProofSelect}
                                />
                              </label>

                              <p className="text-xs text-gray-600">
                                Max 5 images (jpg/png)
                              </p>
                            </div>

                            {adminProofPreview.length > 0 && (
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                {adminProofPreview.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="relative border border-gray-200 rounded-md overflow-hidden"
                                  >
                                    <img
                                      src={p.url}
                                      alt={p.name}
                                      className="w-full h-20 object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeProofFile(idx)}
                                      className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 rounded p-1"
                                      title="Remove"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {adminProofPreview.length === 0 && (
                              <div className="mt-3 text-xs text-gray-500 bg-gray-50 border border-dashed rounded-md p-3">
                                No proof uploaded yet. Admin can attach images
                                as evidence of action taken.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-5">
                        <button
                          onClick={handleUpdate}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition font-bold"
                        >
                          <Save size={16} />
                          Save Update
                        </button>

                        <button
                          onClick={() => setEditingReport(null)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-bold"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>

                      {/* NOTE */}
                      <p className="text-xs text-gray-600 mt-3">
                        Note: Proof upload will work only if backend accepts
                        attachments in this update route.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              title="Close"
            >
              <X size={32} />
            </button>

            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[85vh] rounded-lg border border-white/10"
            />

            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white text-blue-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-100 font-bold"
            >
              <ExternalLink size={16} />
              Open Full Size
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
