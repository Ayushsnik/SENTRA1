import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
  to={user?.role === "admin" ? "/admin" : "/dashboard"}
  className="flex items-center space-x-2 font-bold text-xl"
>

            <Shield className="h-8 w-8" />
            <span>Sentra</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* ✅ Dashboard hidden ONLY for admin */}
            {!isAdmin && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
            )}

            {/* ✅ Report Incident hidden for admin */}
            {!isAdmin && (
              <Link
                to="/report"
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <FileText size={18} />
                <span>Report Incident</span>
              </Link>
            )}

            {/* ✅ My Reports hidden for admin */}
            {!isAdmin && (
              <Link
                to="/my-reports"
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <AlertCircle size={18} />
                <span>My Reports</span>
              </Link>
            )}

            {/* Awareness (keep for all) */}
            <Link
              to="/awareness"
              className="flex items-center space-x-1 hover:text-blue-200 transition"
            >
              <BookOpen size={18} />
              <span>Awareness</span>
            </Link>

            {/* Admin link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 hover:text-blue-200 transition"
              >
                <User size={18} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-blue-200 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* ✅ Dashboard hidden for admin */}
            {!isAdmin && (
              <Link
                to="/dashboard"
                className="block py-2 hover:bg-white/10 rounded px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {/* ✅ Report Incident hidden for admin */}
            {!isAdmin && (
              <Link
                to="/report"
                className="block py-2 hover:bg-white/10 rounded px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Report Incident
              </Link>
            )}

            {/* ✅ My Reports hidden for admin */}
            {!isAdmin && (
              <Link
                to="/my-reports"
                className="block py-2 hover:bg-white/10 rounded px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Reports
              </Link>
            )}

            {/* Awareness */}
            <Link
              to="/awareness"
              className="block py-2 hover:bg-white/10 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Awareness Hub
            </Link>

            {/* Admin Panel */}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 hover:bg-white/10 rounded px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left py-2 hover:bg-white/10 rounded px-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
