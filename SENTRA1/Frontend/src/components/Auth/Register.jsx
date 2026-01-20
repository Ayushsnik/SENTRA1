import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Shield, Mail, Lock, User, IdCard } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    role: "student", // ✅ fixed student only
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;

      await register(registerData);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
                  Student Registration
                </h1>
                <p className="text-sm text-gray-600">
                  Create your Sentra student account
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8dfcf] bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address *
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

              {/* Student ID */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <IdCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g. ID123456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e8dfcf] bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Password *
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                {loading ? "Creating Account..." : "Create Student Account"}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-700">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-700 font-extrabold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Only students can register here. Admin accounts are created by
                the institution.
              </p>
            </div>
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

export default Register;
