import React, { useState, useEffect } from "react";
import { incidentsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  FileText,
  Search,
  Filter,
  AlertCircle,
  FileImage,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  // 🔥 Image preview modal
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterStatus]);

  const fetchReports = async () => {
    try {
      const { data } = await incidentsAPI.getMyReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.referenceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In Review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#f7f3e9]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* GOV STYLE HEADER */}
        <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="text-white" size={26} />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Citizen Report Portal
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track your reports, status updates & admin action proof.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredReports.length}
              </p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title or reference ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#e7ddc8] rounded-lg bg-[#fffdf8] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#e7ddc8] rounded-lg bg-[#fffdf8] focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* REPORTS LIST */}
        <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-6">
          {loading ? (
            <div className="text-center py-14">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your case files...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-14">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-700 text-lg font-semibold">
                No reports found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters."
                  : "You haven't submitted any reports yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className="border border-[#eadfca] rounded-xl overflow-hidden bg-[#fffdf8] hover:shadow-md transition cursor-pointer"
                >
                  {/* CASE FILE STRIP */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#eadfca] bg-[#fbf6ea]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <FolderOpen size={16} className="text-blue-600" />
                      CASE FILE
                      <span className="text-gray-500 font-medium">
                        • {report.referenceId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                          report.priority
                        )}`}
                      >
                        {report.priority}
                      </span>
                    </div>
                  </div>

                  {/* MAIN BODY */}
                  <div className="p-5 grid lg:grid-cols-12 gap-4">
                    {/* LEFT FILE INDEX */}
                    <div className="lg:col-span-4 bg-white border border-[#eadfca] rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        File Index
                      </p>

                      <div className="mt-3 space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Reference ID</p>
                          <p className="font-semibold text-gray-900">
                            {report.referenceId}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                            <Tag size={14} />
                            {report.category}
                          </span>
                        </div>

                        {(report.adminProof?.length > 0 ||
                          report.attachments?.length > 0) && (
                          <div className="pt-2">
                            <p className="text-gray-500 text-xs mb-1">
                              Evidence Summary
                            </p>
                            <div className="text-xs text-gray-700 flex items-center gap-2">
                              <FileImage size={14} className="text-gray-500" />
                              <span>
                                {report.attachments?.length || 0} user file(s),{" "}
                                {report.adminProof?.length || 0} admin proof(s)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT DETAILS */}
                    <div className="lg:col-span-8">
                      <h3 className="text-lg font-bold text-gray-900">
                        {report.title}
                      </h3>

                      <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-gray-500">Incident:</span>
                          <span className="font-medium">
                            {formatDate(report.incidentDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-gray-500">Submitted:</span>
                          <span className="font-medium">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span className="text-gray-500">Location:</span>
                          <span className="font-medium">
                            {report.location || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-700">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Summary
                        </p>
                        <p className="mt-1 line-clamp-2">
                          {report.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-4 text-xs text-blue-700 font-semibold flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Click to open full case file
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#fffdf8] border border-[#e7ddc8] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eadfca] bg-[#fbf6ea] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <FolderOpen size={16} className="text-blue-600" />
                  CASE FILE
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedReport.referenceId}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted on {formatDateTime(selectedReport.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-10 h-10 rounded-lg border border-[#eadfca] bg-white hover:bg-gray-50 text-gray-700 text-xl flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    selectedReport.status
                  )}`}
                >
                  {selectedReport.status}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                    selectedReport.priority
                  )}`}
                >
                  Priority: {selectedReport.priority}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200">
                  Category: {selectedReport.category}
                </span>
              </div>

              {/* Title + Description */}
              <div className="bg-white border border-[#eadfca] rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Title
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {selectedReport.title}
                </p>

                <p className="text-xs text-gray-500 uppercase tracking-wide mt-4">
                  Description
                </p>
                <p className="text-gray-800 mt-1 whitespace-pre-wrap leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              {/* Incident Meta */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#eadfca] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Incident Date
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {formatDate(selectedReport.incidentDate)}
                  </p>
                </div>

                <div className="bg-white border border-[#eadfca] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedReport.location || "N/A"}
                  </p>
                </div>

                <div className="bg-white border border-[#eadfca] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Witnesses
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {selectedReport.witnesses || "N/A"}
                  </p>
                </div>
              </div>

              {/* USER ATTACHMENTS */}
              {selectedReport.attachments &&
                selectedReport.attachments.length > 0 && (
                  <div className="bg-white border border-[#eadfca] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FileImage size={18} className="text-gray-600" />
                      <h3 className="font-bold text-gray-900">
                        Your Attachments ({selectedReport.attachments.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedReport.attachments.map((att, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="group text-left"
                          onClick={() => setSelectedImage(att.path)}
                        >
                          <img
                            src={att.path}
                            alt={att.filename}
                            className="w-full h-28 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition"
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {att.filename || "attachment"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* ADMIN PROOF */}
              {selectedReport.adminProof &&
                selectedReport.adminProof.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FileImage size={18} className="text-blue-700" />
                      <h3 className="font-bold text-blue-900">
                        Admin Action Proof ({selectedReport.adminProof.length})
                      </h3>
                    </div>

                    <p className="text-xs text-blue-800 mb-4">
                      Evidence uploaded by the administration after reviewing
                      your report.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedReport.adminProof.map((proof, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="group text-left"
                          onClick={() => setSelectedImage(proof.path)}
                        >
                          <img
                            src={proof.path}
                            alt={proof.filename}
                            className="w-full h-28 object-cover rounded-lg border border-blue-200 group-hover:opacity-90 transition"
                          />
                          <p className="text-xs text-blue-900 mt-1 truncate">
                            {proof.filename || "proof"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Admin Notes */}
              {selectedReport.adminNotes &&
                selectedReport.adminNotes.length > 0 && (
                  <div className="bg-white border border-[#eadfca] rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3">Admin Notes</h3>
                    <div className="space-y-2">
                      {selectedReport.adminNotes.map((n, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-gray-800 bg-[#fffdf8] border border-[#eadfca] rounded-lg p-3"
                        >
                          {n.note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold"
              >
                Close Case File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-3xl"
            >
              ×
            </button>

            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg"
            />

            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
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

export default MyReports;
