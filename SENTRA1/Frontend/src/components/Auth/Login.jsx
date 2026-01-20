import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Shield, Mail, Lock, UserCog, GraduationCap } from "lucide-react";

const Login = () => {
  const [loginType, setLoginType] = useState("student"); // student | admin
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success("Login successful!");

      // ✅ frontend redirect only (backend unchanged)
      if (loginType === "admin") navigate("/admin");
      else navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* SINGLE CARD */}
        <div className="bg-[#fffdf7] border border-[#e8dfcf] rounded-2xl shadow-lg overflow-hidden">
          {/* TOP STRIP */}
          <div className="px-6 py-5 bg-[#fbf7ee] border-b border-[#eee3d3]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center shadow-sm">
                <Shield className="text-white" size={26} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">
                  Welcome to Sentra
                </h1>
                <p className="text-sm text-gray-600">
                  Secure campus reporting portal
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6">
            {/* Toggle */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Login As
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginType("student")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold transition ${
                    loginType === "student"
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-[#fbf7ee] text-gray-800 border-[#e8dfcf] hover:bg-[#f5efe2]"
                  }`}
                >
                  <GraduationCap size={18} />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setLoginType("admin")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold transition ${
                    loginType === "admin"
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-[#fbf7ee] text-gray-800 border-[#e8dfcf] hover:bg-[#f5efe2]"
                  }`}
                >
                  <UserCog size={18} />
                  Admin
                </button>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8dfcf] bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8dfcf] bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-blue-700 text-white py-3 rounded-xl font-extrabold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Signing in..."
                  : loginType === "admin"
                  ? "Sign In as Admin"
                  : "Sign In as Student"}
              </button>
            </form>

            {/* Footer Link */}
            {loginType === "student" && (
              <div className="mt-5 text-center">
                <p className="text-sm text-gray-700">
                  New student?{" "}
                  <Link
                    to="/register"
                    className="text-blue-700 font-extrabold hover:underline"
                  >
                    Register as Student
                  </Link>
                </p>
              </div>
            )}

            {loginType === "admin" && (
              <div className="mt-5 text-center">
                <p className="text-xs text-gray-600">
                  Admin accounts are managed by the institution.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-xs text-gray-500 mt-5">
          © {new Date().getFullYear()} Sentra • All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
