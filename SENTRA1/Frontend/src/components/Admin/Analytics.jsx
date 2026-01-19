import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return `${base} bg-blue-50 text-blue-800 border-blue-200`; // Pending
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
    return `${base} bg-indigo-50 text-indigo-800 border-indigo-200`; // Medium
  };

  // ---------- Graph Data ----------
  const currentMonthLabel = useMemo(() => {
    if (!monthlyTrend.length) return "This Month";
    const last = monthlyTrend[monthlyTrend.length - 1];
    const m = last?._id?.month;
    const y = last?._id?.year;
    if (!m || !y) return "This Month";
    const name = new Date(y, m - 1).toLocaleString("en-IN", { month: "short" });
    return `${name} ${y}`;
  }, [monthlyTrend]);

  const stackedSnapshotData = useMemo(() => {
    return [
      {
        name: currentMonthLabel,
        pending: summary.pending,
        inReview: summary.inReview,
        resolved: summary.resolved,
      },
    ];
  }, [summary, currentMonthLabel]);

  const categoryData = useMemo(() => {
    return [...categoryStats]
      .map((c) => ({ name: c._id, count: c.count }))
      .sort((a, b) => b.count - a.count);
  }, [categoryStats]);

  const priorityData = useMemo(() => {
    const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    return [...priorityStats]
      .map((p) => ({ name: p._id, value: p.count }))
      .sort((a, b) => (order[a.name] || 99) - (order[b.name] || 99));
  }, [priorityStats]);

  const PRIORITY_COLORS = {
    Critical: "#ef4444",
    High: "#f97316",
    Medium: "#3b82f6",
    Low: "#22c55e",
  };

  // ---------- Derived Summary ----------
  const pendingPct = useMemo(() => {
    if (!summary.total) return 0;
    return Math.round((summary.pending / summary.total) * 100);
  }, [summary]);

  const resolvedPct = useMemo(() => {
    if (!summary.total) return 0;
    return Math.round((summary.resolved / summary.total) * 100);
  }, [summary]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-700 mt-3 font-semibold">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-lg shadow-lg p-7 text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">
                Incident Monitoring Center
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Graphical analytics overview • Live activity feed
              </p>

              {/* Quick Summary Strip */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold">
                  Pending: {pendingPct}%
                </span>
                <span className="bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold">
                  Resolved: {resolvedPct}%
                </span>
                <span className="bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold">
                  Total Reports: {summary.total}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2 bg-white/15 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-green-300" />
                <span className="text-sm font-bold">Live</span>
              </div>

              <div className="text-xs text-white/90 font-semibold">
                Last Updated: {formatUpdated(lastUpdated)}
              </div>

              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-md font-bold shadow hover:bg-blue-50 transition"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI
              title="Total"
              value={summary.total}
              icon={<ClipboardList className="w-5 h-5" />}
            />
            <KPI
              title="Pending"
              value={summary.pending}
              icon={<Clock className="w-5 h-5" />}
            />
            <KPI
              title="In Review"
              value={summary.inReview}
              icon={<AlertCircle className="w-5 h-5" />}
            />
            <KPI
              title="Resolved"
              value={summary.resolved}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Priority Donut */}
          <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm p-5 lg:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                Priority Distribution
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Risk Levels</span>
              </div>
            </div>

            {priorityData.length === 0 ? (
              <p className="text-gray-500 text-sm">No priority data</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PRIORITY_COLORS[entry.name] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Status Snapshot */}
          <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm p-5 lg:col-span-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                Status Snapshot
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                <Activity className="w-4 h-4" />
                <span>{currentMonthLabel}</span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stackedSnapshotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    name="Pending"
                  />
                  <Area
                    type="monotone"
                    dataKey="inReview"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#fde68a"
                    name="In Review"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Alerts */}
          <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm p-5 lg:col-span-3">
            <h2 className="text-lg font-extrabold text-gray-900 mb-3">
              Live Alerts
            </h2>

            {recentIncidents.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent incidents</p>
            ) : (
              <div className="space-y-3 max-h-[290px] overflow-auto pr-1">
                {recentIncidents.map((inc) => (
                  <div
                    key={inc._id}
                    className="border border-[#e8dfcf] bg-white rounded-lg p-3 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-sm text-gray-900">
                          {inc.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 font-semibold">
                          {inc.referenceId} • {inc.category}
                        </p>
                      </div>

                      <span className={getStatusBadge(inc.status)}>
                        {inc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className={getPriorityBadge(inc.priority)}>
                        {inc.priority}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">
                        {formatDateTime(inc.createdAt)}
                      </span>
                    </div>

                    {inc.reportedBy?.name && (
                      <p className="text-xs text-gray-600 mt-2">
                        Reported by:{" "}
                        <span className="font-bold">{inc.reportedBy.name}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Bar */}
          <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-lg shadow-sm p-5 lg:col-span-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-gray-900">
                Category Breakdown
              </h2>
              <p className="text-sm text-gray-600 font-semibold">
                Most reported incident types
              </p>
            </div>

            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-sm">No category stats</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPI = ({ title, value, icon }) => (
  <div className="bg-white border border-[#e8dfcf] rounded-lg p-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
    <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default Analytics;
