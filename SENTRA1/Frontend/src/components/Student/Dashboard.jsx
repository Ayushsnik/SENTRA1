import React, { useEffect, useState } from "react";
import { incidentsAPI, adminAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user.role === "admin") {
        // ✅ ADMIN → SYSTEM-WIDE DATA
        const { data } = await adminAPI.analytics();

        setStats({
          total: data.summary.total,
          pending: data.summary.pending,
          inReview: data.summary.inReview,
          resolved: data.summary.resolved,
        });

        setRecent(data.recentIncidents);
      } else {
        // ✅ STUDENT → OWN REPORTS
        const { data } = await incidentsAPI.myReports();

        setStats({
          total: data.length,
          pending: data.filter((r) => r.status === "Pending").length,
          inReview: data.filter((r) => r.status === "In Review").length,
          resolved: data.filter((r) => r.status === "Resolved").length,
        });

        setRecent(data.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome back, {user.role === "admin" ? "Admin" : user.name}
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Total Reports" value={stats.total} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="In Review" value={stats.inReview} />
        <Stat title="Resolved" value={stats.resolved} />
      </div>

      {/* RECENT */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-semibold mb-3">Recent Reports</h2>

        {recent.length === 0 ? (
          <p className="text-gray-500">No reports yet</p>
        ) : (
          recent.map((r) => (
            <div key={r._id} className="border-b py-2">
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-500">
                {r.referenceId} • {r.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;
