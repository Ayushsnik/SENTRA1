import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
  Pencil,
} from "lucide-react";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const { data } = await adminAPI.analytics(); // ✅ BACKEND SAME
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load admin analytics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = analytics?.summary || {
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  };

  const recentIncidents = analytics?.recentIncidents || [];

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded border";
    if (status === "Resolved")
      return `${base} bg-green-50 text-green-800 border-green-200`;
    if (status === "In Review")
      return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
    return `${base} bg-blue-50 text-blue-800 border-blue-200`; // Pending
  };

  const stats = useMemo(
    () => [
      {
        title: "Total Reports",
        value: summary.total,
        icon: FileText,
        color: "text-blue-700",
        border: "border-blue-200",
        bg: "bg-blue-50",
      },
      {
        title: "Pending",
        value: summary.pending,
        icon: Clock,
        color: "text-yellow-800",
        border: "border-yellow-200",
        bg: "bg-yellow-50",
      },
      {
        title: "In Review",
        value: summary.inReview,
        icon: AlertCircle,
        color: "text-orange-800",
        border: "border-orange-200",
        bg: "bg-orange-50",
      },
      {
        title: "Resolved",
        value: summary.resolved,
        icon: CheckCircle,
        color: "text-green-800",
        border: "border-green-200",
        bg: "bg-green-50",
      },
    ],
    [summary]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#f7f3ea] min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full" />
        <p className="text-gray-600 mt-4">Loading Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f3ea] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* GOV HEADER */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm">
          {/* Top Strip */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#eee3d3] bg-[#fbf7ee]">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ShieldCheck className="text-blue-700" size={18} />
              <span className="font-semibold">
                Incident Reporting & Monitoring Portal
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Admin Access</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAnalytics(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-[#e8dfcf] rounded-md bg-[#fffdf7] hover:bg-[#fbf7ee] transition"
              >
                <RefreshCcw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              {/* Analytics same */}
              <Link
                to="/admin/analytics"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-blue-700 text-white hover:bg-blue-800 transition"
              >
                <BarChart3 size={16} />
                Analytics
              </Link>
            </div>
          </div>

          {/* Title Area */}
          <div className="px-6 py-5">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Official overview of incident submissions, current workload and
              latest reports.
            </p>
          </div>
        </div>

        {/* KPI SUMMARY */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[#eee3d3] bg-[#fbf7ee]">
            <h2 className="text-base font-bold text-gray-900">
              Summary Statistics
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Snapshot of overall system report counts
            </p>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <GovStatBox key={s.title} stat={s} />
            ))}
          </div>
        </div>

        {/* RECENT REPORTS */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-[#eee3d3] bg-[#fbf7ee] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Recent Reports Register
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Admin can review and update report status from the register.
              </p>
            </div>

            {/* UPDATED BUTTON */}
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
              title="Open Reports Register to update status, assign staff, and resolve incidents"
            >
              <Pencil size={16} />
              Manage Reports (Update Status)
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fbf7ee]">
                <tr className="text-left border-b border-[#eee3d3]">
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Reference ID
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Created On
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentIncidents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-600"
                    >
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  recentIncidents.map((r, idx) => (
                    <tr
                      key={r._id}
                      className={`border-b border-[#f0e6d8] hover:bg-[#fbf7ee] transition ${
                        idx % 2 === 0 ? "bg-[#fffdf7]" : "bg-[#fffaf0]"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {r.referenceId}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <span className="font-semibold">{r.title}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">{r.category}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(r.status)}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDateTime(r.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 text-xs text-gray-600 bg-[#fbf7ee] border-t border-[#eee3d3]">
            Note: The register is the official area where Admin can edit/update
            report workflow status.
          </div>
        </div>
      </div>
    </div>
  );
};

const GovStatBox = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <div className={`border ${stat.border} rounded-lg p-4 ${stat.bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {stat.title}
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {stat.value}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-md border border-[#e8dfcf] bg-[#fffdf7] flex items-center justify-center ${stat.color}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
