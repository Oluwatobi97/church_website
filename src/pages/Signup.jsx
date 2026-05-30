import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.register(name, email, password, "member");
      if (result) {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.2),_transparent_25%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] items-end">
          <div className="space-y-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/15 px-4 py-2 text-sm font-semibold text-emerald-100">
              Join our community
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Create your account and start connecting.
              </h1>
              <p className="max-w-xl text-slate-200 leading-relaxed">
                Sign up to access devotional resources, announcements, and
                church tools in one place.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-sm text-emerald-200 uppercase tracking-[0.2em] mb-3">
                  Community
                </p>
                <p className="text-white font-semibold">
                  Grow with a supportive church family.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-sm text-emerald-200 uppercase tracking-[0.2em] mb-3">
                  Events
                </p>
                <p className="text-white font-semibold">
                  Be the first to hear about services and outreach.
                </p>
              </div>
            </div>
          </div>

          <div className="relative lg:self-end">
            <div className="absolute -right-10 bottom-10 hidden xl:block h-40 w-40 rounded-full bg-emerald-600/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-900/10 border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Sign Up</h2>
                  <p className="text-sm text-slate-500">
                    Create a member account.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Welcome
                </span>
              </div>

              {error && (
                <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Full Name
                  </span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder="Create password"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-white font-semibold shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Login instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
