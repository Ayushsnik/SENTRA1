import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  ShieldAlert,
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ✅ SAFE DEFAULTS (so hooks never crash)
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
    return new Date(iso).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center";
    if (status === "Resolved")
      return `${base} bg-green-50 text-green-700 border-green-200`;
    if (status === "In Review")
      return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
    return `${base} bg-blue-50 text-blue-700 border-blue-200`; // Pending
  };

  const getPriorityBadge = (priority) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center";
    if (priority === "Critical")
      return `${base} bg-red-50 text-red-700 border-red-200`;
    if (priority === "High")
      return `${base} bg-orange-50 text-orange-700 border-orange-200`;
    return `${base} bg-gray-50 text-gray-700 border-gray-200`; // Medium/Low
  };

  // ---------- Graph Data ----------
  const currentMonthLabel = useMemo(() => {
    if (!monthlyTrend.length) return "This Month";
    const last = monthlyTrend[monthlyTrend.length - 1];
    const m = last?._id?.month;
    const y = last?._id?.year;
    if (!m || !y) return "This Month";
    const name = new Date(y, m - 1).toLocaleString("en-US", { month: "short" });
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

  // ✅ Now we can safely return loading UI
  if (loading) {
    return <div className="p-6 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Incident Monitoring Center</h1>
          <p className="text-sm opacity-90 mt-1">
            Graphical analytics overview • Live activity feed
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/15 px-3 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-300" />
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI title="Total" value={summary.total} icon={<ClipboardList className="w-5 h-5" />} />
          <KPI title="Pending" value={summary.pending} icon={<Clock className="w-5 h-5" />} />
          <KPI title="In Review" value={summary.inReview} icon={<AlertCircle className="w-5 h-5" />} />
          <KPI title="Resolved" value={summary.resolved} icon={<CheckCircle className="w-5 h-5" />} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Priority Donut */}
        <div className="bg-white rounded-xl p-5 shadow lg:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Priority Distribution</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldAlert className="w-4 h-4" />
              <span>Risk Levels</span>
            </div>
          </div>

          {priorityData.length === 0 ? (
            <p className="text-gray-400 text-sm">No priority data</p>
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

        {/* Center: Stacked Area Snapshot */}
        <div className="bg-white rounded-xl p-5 shadow lg:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Status Snapshot</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Pending" />
                <Area type="monotone" dataKey="inReview" stackId="1" stroke="#f59e0b" fill="#fde68a" name="In Review" />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke="#22c55e" fill="#bbf7d0" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live Alerts */}
        <div className="bg-white rounded-xl p-5 shadow lg:col-span-3">
          <h2 className="text-lg font-semibold mb-3">Live Alerts</h2>

          {recentIncidents.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent incidents</p>
          ) : (
            <div className="space-y-3 max-h-[290px] overflow-auto pr-1">
              {recentIncidents.map((inc) => (
                <div key={inc._id} className="border rounded-lg p-3 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{inc.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {inc.referenceId} • {inc.category}
                      </p>
                    </div>

                    <span className={getStatusBadge(inc.status)}>{inc.status}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className={getPriorityBadge(inc.priority)}>{inc.priority}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(inc.createdAt)}</span>
                  </div>

                  {inc.reportedBy?.name && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reported by: <span className="font-medium">{inc.reportedBy.name}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: Category Bar */}
        <div className="bg-white rounded-xl p-5 shadow lg:col-span-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <p className="text-sm text-gray-500">Most reported incident types</p>
          </div>

          {categoryData.length === 0 ? (
            <p className="text-gray-400 text-sm">No category stats</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KPI = ({ title, value, icon }) => (
  <div className="border rounded-xl p-4 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
    <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default Analytics;