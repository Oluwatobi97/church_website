import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  BookOpen,
  Megaphone,
  BarChart3,
  LogOut,
  X,
  ChevronRight,
  Church,
} from "lucide-react";

const SidebarContent = ({ filteredItems, onClose, handleLogout }) => (
  <div className="flex flex-col h-full bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-900 text-white shadow-2xl">
    {/* Header */}
    <div className="p-6 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-300/30">
          <Church size={24} className="text-emerald-900 font-bold" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">Church</span>
          <span className="text-xs text-emerald-200 font-medium">Management</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
      >
        <X size={24} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
      {filteredItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => window.innerWidth < 1024 && onClose()}
          className={({ isActive }) => `
            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative
            ${
              isActive
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 shadow-lg shadow-amber-400/30"
                : "text-emerald-100 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <div className="flex items-center gap-3.5">
            <item.icon size={20} className="shrink-0" strokeWidth={2} />
            <span className="font-semibold text-sm">{item.label}</span>
          </div>
          <ChevronRight
            size={16}
            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            strokeWidth={3}
          />
        </NavLink>
      ))}
    </nav>

    {/* Footer / Logout */}
    <div className="p-4 border-t border-white/10 space-y-2">
      <button
        onClick={handleLogout}
        className="flex items-center gap-3.5 px-4 py-3 w-full rounded-xl text-emerald-100 hover:text-red-200 hover:bg-red-500/10 transition-all duration-300 group font-semibold text-sm"
      >
        <LogOut size={20} className="group-hover:scale-110 transition-transform" strokeWidth={2} />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "admin";

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["admin", "council"],
    },
    {
      icon: Users,
      label: "Attendance",
      path: "/dashboard/attendance",
      roles: ["admin", "council"],
    },
    {
      icon: Wallet,
      label: "Finance",
      path: "/dashboard/finance",
      roles: ["admin", "council"],
    },
    {
      icon: Calendar,
      label: "Timetable",
      path: "/dashboard/timetable",
      roles: ["admin", "council", "member"],
    },
    {
      icon: BookOpen,
      label: "Devotion",
      path: "/dashboard/devotion",
      roles: ["admin", "council", "member"],
    },
    {
      icon: Megaphone,
      label: "Announcements",
      path: "/dashboard/announcements",
      roles: ["admin", "council", "member"],
    },
    {
      icon: BarChart3,
      label: "Reports",
      path: "/dashboard/reports",
      roles: ["admin"],
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[250px] z-40">
        <SidebarContent
          filteredItems={filteredItems}
          onClose={onClose}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isOpen && (
        <>
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-200"
          />
          <aside className="fixed left-0 top-0 h-full w-[280px] max-w-[80%] z-[70] lg:hidden animate-in slide-in-from-left duration-300">
            <SidebarContent
              filteredItems={filteredItems}
              onClose={onClose}
              handleLogout={handleLogout}
            />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;