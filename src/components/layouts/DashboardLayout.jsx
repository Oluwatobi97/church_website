import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "../Sidebar";
import MobileBottomNav from "../MobileBottomNav";

const DashboardLayout = ({ title = "Dashboard" }) => {
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName") || "Admin";
  const userRole = localStorage.getItem("userRole") || "member";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-16 flex items-center justify-between px-4 shadow-sm">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-emerald-600"
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
          
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-bold text-emerald-700 text-base">{title}</span>
            <span className="text-xs text-gray-500 capitalize font-medium">{userRole}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
              {userName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <Outlet />
      </main>

      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default DashboardLayout;