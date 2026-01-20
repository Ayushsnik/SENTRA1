import React, { useEffect, useMemo, useState } from "react";
import { adminAPI } from "@/services/api";

import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.analytics();
      setAnalytics(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Analytics fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ✅ SAFE DEFAULTS
  const summary = analytics?.summary || {
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  };

  const categoryStats = analytics?.categoryStats || [];
  const priorityStats = analytics?.priorityStats || [];
  const recentIncidents = analytics?.recentIncidents || [];
  const monthlyTrend = analytics?.monthlyTrend || [];

  // ---------- Helpers ----------
  const formatDateTime = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-IN");
  };

  const formatUpdated = (date) => {
    if (!date) return "—";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-bold border inline-flex items-center";
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
      "px-2 py-1 rounded-full text-xs font-bold border inline-flex items-center";
    if (priority === "Critical")
      return `${base} bg-red-50 text-red-800 border-red-200`;
    if (priority === "High")
      return `${base} bg-orange-50 text-orange-800 border-orange-200`;
    if (priority === "Low")
      return `${base} bg-gray-100 text-gray-800 border-gray-200`;
    return `${base} bg-indigo-50 text-indigo-800 border-indigo-200`;
  };

  const currentMonthLabel = useMemo(() => {
    if (!monthlyTrend.length) return "This Month";
    const last = monthlyTrend[monthlyTrend.length - 1];
    const m = last?._id?.month;
    const y = last?._id?.year;
    if (!m || !y) return "This Month";
    const name = new Date(y, m - 1).toLocaleString("en-IN", { month: "short" });
    return `${name} ${y}`;
  }, [monthlyTrend]);

  const stackedSnapshotData = [
    {
      name: currentMonthLabel,
      pending: summary.pending,
      inReview: summary.inReview,
      resolved: summary.resolved,
    },
  ];

  const categoryData = [...categoryStats]
    .map((c) => ({ name: c._id, count: c.count }))
    .sort((a, b) => b.count - a.count);

  const priorityData = [...priorityStats].map((p) => ({
    name: p._id,
    value: p.count,
  }));

  const PRIORITY_COLORS = {
    Critical: "#ef4444",
    High: "#f97316",
    Medium: "#3b82f6",
    Low: "#22c55e",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-lg shadow-lg p-7 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold">
                Incident Monitoring Center
              </h1>
              <p className="text-sm opacity-90">
                Graphical analytics overview
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="bg-white text-blue-800 px-4 py-2 rounded-md font-bold flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <p className="text-xs mt-2">
            Last Updated: {formatUpdated(lastUpdated)}
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Total" value={summary.total} icon={<ClipboardList />} />
          <KPI title="Pending" value={summary.pending} icon={<Clock />} />
          <KPI title="In Review" value={summary.inReview} icon={<AlertCircle />} />
          <KPI title="Resolved" value={summary.resolved} icon={<CheckCircle />} />
        </div>
      </div>
    </div>
  );
};

const KPI = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
    <div>
      <p className="text-xs text-gray-500 font-bold">{title}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default Analytics;
