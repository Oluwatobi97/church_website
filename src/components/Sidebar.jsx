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
} from "lucide-react";

const SidebarContent = ({ filteredItems, onClose, handleLogout }) => (
  <div className="flex flex-col h-full bg-church-green text-white shadow-2xl">
    {/* Header */}
    <div className="p-6 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-church-gold rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-church-green font-bold text-xl">C</span>
        </div>
        <span className="font-bold text-xl tracking-tight">ChurchApp</span>
      </div>
      <button
        onClick={onClose}
        className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      {filteredItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => window.innerWidth < 1024 && onClose()}
          className={({ isActive }) => `
            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
            ${
              isActive
                ? "bg-church-gold text-church-green shadow-lg"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <item.icon size={22} className="shrink-0" />
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronRight
            size={16}
            className={`opacity-0 group-hover:opacity-100 transition-opacity`}
          />
        </NavLink>
      ))}
    </nav>

    {/* Footer / Logout */}
    <div className="p-4 border-t border-white/10">
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
      >
        <LogOut size={22} />
        <span className="font-medium">Sign Out</span>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
          <aside className="fixed left-0 top-0 h-full w-[280px] max-w-[80%] z-[70] lg:hidden">
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
