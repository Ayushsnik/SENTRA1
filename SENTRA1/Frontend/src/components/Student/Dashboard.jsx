import React, { useEffect, useMemo, useState } from "react";
import { incidentsAPI, adminAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileText,
  ShieldCheck,
  BookOpen,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // =====================
      // ADMIN DASHBOARD
      // =====================
      if (user.role === "admin") {
        const { data } = await adminAPI.analytics();

        // ⚠️ Keeping your existing backend response mapping SAME
        setStats({
          total: data.total,
          pending: data.pending,
          inReview: data.inReview,
          resolved: data.resolved,
        });

        setRecent([]); // admin recent optional
      }

      // =====================
      // STUDENT DASHBOARD
      // =====================
      else {
        const { data } = await incidentsAPI.getMyReports();

        setStats({
          total: data.length,
          pending: data.filter((r) => r.status === "Pending").length,
          inReview: data.filter((r) => r.status === "In Review").length,
          resolved: data.filter((r) => r.status === "Resolved").length,
        });

        setRecent(data.slice(0, 6));
      }
    } catch (err) {
      console.error("❌ Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const progress = useMemo(() => {
    const total = stats.total || 0;
    const safe = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));
    return {
      pending: safe(stats.pending),
      inReview: safe(stats.inReview),
      resolved: safe(stats.resolved),
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3e9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3e9]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* GOV HEADER */}
        <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                SENTRA • Incident Reporting System
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                Welcome, {user.role === "admin" ? "Administrator" : user.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user.role === "admin"
                  ? "Monitor reports, verify action proof, and review analytics."
                  : "Track your case files, updates, and evidence uploaded by admin."}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#fbf6ea] border border-[#e7ddc8] px-4 py-2 rounded-lg">
              <Activity className="text-blue-700" size={18} />
              <p className="text-sm font-semibold text-gray-800">
                Live Status Overview
              </p>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            title="Total Reports"
            value={stats.total}
            icon={<ClipboardList size={18} />}
            hint="All case files submitted"
          />
          <KPI
            title="Pending"
            value={stats.pending}
            icon={<Clock size={18} />}
            hint="Awaiting review"
          />
          <KPI
            title="In Review"
            value={stats.inReview}
            icon={<AlertCircle size={18} />}
            hint="Under verification"
          />
          <KPI
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle size={18} />}
            hint="Action taken"
          />
        </div>

        {/* PROGRESS STRIP */}
        <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Status Distribution
            </h2>
            <span className="text-xs text-gray-500">
              Based on your current reports
            </span>
          </div>

          <div className="space-y-4">
            <ProgressRow
              label="Pending"
              percent={progress.pending}
              barClass="bg-yellow-400"
            />
            <ProgressRow
              label="In Review"
              percent={progress.inReview}
              barClass="bg-blue-500"
            />
            <ProgressRow
              label="Resolved"
              percent={progress.resolved}
              barClass="bg-green-500"
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        {user.role !== "admin" && (
          <div className="grid md:grid-cols-3 gap-4">
            <QuickAction
              title="Report an Incident"
              desc="Submit a new case file with attachments."
              icon={<FileText size={18} />}
              onClick={() => navigate("/report")}
            />
            <QuickAction
              title="View My Reports"
              desc="Track status, admin notes & proof images."
              icon={<ShieldCheck size={18} />}
              onClick={() => navigate("/my-reports")}
            />
            <QuickAction
              title="Awareness Hub"
              desc="Safety guidelines, policies & emergency info."
              icon={<BookOpen size={18} />}
              onClick={() => navigate("/awareness")}
            />
          </div>
        )}

        {/* RECENT REPORTS */}
        <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {user.role === "admin" ? "Latest Activity" : "Recent Reports"}
            </h2>

            {user.role !== "admin" && (
              <button
                onClick={() => navigate("/my-reports")}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRight size={16} />
              </button>
            )}
          </div>

          {user.role === "admin" ? (
            <p className="text-gray-600 text-sm">
              Admin dashboard uses Analytics + Manage Reports for detailed view.
            </p>
          ) : recent.length === 0 ? (
            <p className="text-gray-500">No reports yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-[#fbf6ea] border border-[#eadfca]">
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Case Title
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Reference ID
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-800">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recent.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b hover:bg-[#fffdf8] transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.referenceId}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusBadge(r.status)}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ======================
   COMPONENTS
====================== */

const KPI = ({ title, value, icon, hint }) => {
  return (
    <div className="bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{hint}</p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

const ProgressRow = ({ label, percent, barClass }) => {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-gray-600">{percent}%</p>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-3 ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const QuickAction = ({ title, desc, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-[#e7ddc8] rounded-xl shadow-sm p-5 hover:shadow-md transition group"
    >
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#fbf6ea] border border-[#eadfca] flex items-center justify-center text-blue-700">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-gray-400 group-hover:text-blue-700 transition"
        />
      </div>

      <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </button>
  );
};

const getStatusBadge = (status) => {
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center";

  if (status === "Resolved")
    return `${base} bg-green-100 text-green-800 border-green-200`;

  if (status === "In Review")
    return `${base} bg-blue-100 text-blue-800 border-blue-200`;

  if (status === "Closed")
    return `${base} bg-gray-100 text-gray-800 border-gray-200`;

  return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`; // Pending
};

export default Dashboard;
