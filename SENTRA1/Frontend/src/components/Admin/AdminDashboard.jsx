import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await adminAPI.analytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load admin analytics", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { summary, recentIncidents } = analytics;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-blue-100 mt-1">
          System-wide incident overview
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat icon={FileText} title="Total Reports" value={summary.total} />
        <Stat icon={Clock} title="Pending" value={summary.pending} />
        <Stat icon={AlertCircle} title="In Review" value={summary.inReview} />
        <Stat icon={CheckCircle} title="Resolved" value={summary.resolved} />
      </div>

      {/* RECENT REPORTS */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Reports</h2>
          <Link
            to="/admin/reports"
            className="text-blue-600 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentIncidents.length === 0 ? (
          <p className="text-gray-500">No incidents found</p>
        ) : (
          <div className="space-y-3">
            {recentIncidents.map((r) => (
              <div
                key={r._id}
                className="border rounded p-4 hover:shadow-sm transition"
              >
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-gray-500">
                  {r.referenceId} • {r.category} • {r.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK LINK */}
      <Link
        to="/admin/analytics"
        className="flex items-center gap-3 bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700"
      >
        <BarChart3 />
        <div>
          <p className="text-lg font-semibold">View Analytics</p>
          <p className="text-blue-100 text-sm">
            Charts & trends
          </p>
        </div>
      </Link>
    </div>
  );
};

const Stat = ({ icon: Icon, title, value }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
        <Icon />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
