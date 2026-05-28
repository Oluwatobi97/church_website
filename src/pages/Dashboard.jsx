import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  Wallet,
  Menu,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Megaphone,
  Eye,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import { useNavigate } from "react-router-dom";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -6, scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient} cursor-default`}
  >
    {/* Background icon watermark */}
    <div className="absolute -right-3 -top-3 opacity-10">
      <Icon size={90} />
    </div>

    {/* Icon badge */}
    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
      <Icon size={20} />
    </div>

    {/* Value */}
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-white/75 text-sm mt-1 font-medium uppercase tracking-wider">
      {label}
    </p>
  </motion.div>
);

// ─── Quick Action Card ────────────────────────────────────────────────────────
const ActionCard = ({ label, icon: Icon, color, onClick, delay }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full"
  >
    <div className={`p-3 rounded-xl mb-3 ${color}`}>
      <Icon size={22} />
    </div>
    <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
      {label}
    </span>
  </motion.button>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userName = localStorage.getItem("userName") || "Admin";
  const userRole = localStorage.getItem("userRole") || "admin";

  const stats = [
    {
      icon: BookOpen,
      label: "Devotions",
      value: 12,
      gradient: "from-blue-500 to-blue-700",
      delay: 0.1,
    },
    {
      icon: Users,
      label: "Attendance",
      value: 85,
      gradient: "from-emerald-500 to-emerald-700",
      delay: 0.2,
    },
    {
      icon: Calendar,
      label: "Timetable",
      value: 5,
      gradient: "from-violet-500 to-violet-700",
      delay: 0.3,
    },
    {
      icon: Megaphone,
      label: "Announcements",
      value: 3,
      gradient: "from-amber-500 to-orange-600",
      delay: 0.4,
    },
  ];

  const quickActions = [
    {
      label: "Add Devotion",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      path: "/devotion",
    },
    {
      label: "Add Timetable",
      icon: Calendar,
      color: "bg-violet-50 text-violet-600",
      path: "/timetable",
    },
    {
      label: "Announcement",
      icon: Megaphone,
      color: "bg-amber-50 text-amber-600",
      path: "/announcements",
    },
    {
      label: "View Attendance",
      icon: Eye,
      color: "bg-emerald-50 text-emerald-600",
      path: "/attendance",
    },
    {
      label: "Finance",
      icon: Wallet,
      color: "bg-rose-50 text-rose-600",
      path: "/finance",
    },
    {
      label: "Reports",
      icon: TrendingUp,
      color: "bg-gray-100 text-gray-600",
      path: "/reports",
    },
  ];

  const recentActivity = [
    {
      title: "Sunday Service Attendance Recorded",
      meta: "Admin • 2 hours ago",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Monthly Tithe Report Generated",
      meta: "System • 5 hours ago",
      icon: Wallet,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "New Devotion: 'The Power of Faith'",
      meta: "Pastor • Yesterday",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Announcement Updated",
      meta: "Council • Yesterday",
      icon: Megaphone,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* ── Mobile Header ─────────────────────────────────────────────── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>

          <span className="font-bold text-emerald-700 text-lg">
            Church Dashboard
          </span>

          {/* Avatar */}
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        {/* ── Desktop Header ────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Here's your church overview for today.
            </p>
          </div>
          <button
            onClick={() => navigate("/attendance")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all"
          >
            <Plus size={18} />
            New Record
          </button>
        </div>

        {/* ── Page Content ──────────────────────────────────────────────── */}
        <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
          {/* Mobile welcome */}
          <div className="lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">
              Welcome, {userName}! 👋
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Here's your church overview.
            </p>
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </section>

          {/* ── Quick Actions + Recent Activity ─────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h3 className="text-base font-bold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <ActionCard
                    key={i}
                    {...action}
                    delay={0.1 + i * 0.05}
                    onClick={() => navigate(action.path)}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">
                  Recent Activity
                </h3>
                <button className="text-emerald-600 text-sm font-semibold hover:underline">
                  View All
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {recentActivity.map(({ icon: Icon, title, meta, color }, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      i !== recentActivity.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{meta}</p>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="text-gray-300 shrink-0 mt-1"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ── Role Badge ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Logged in as</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full capitalize">
              {userRole}
            </span>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Dashboard;
