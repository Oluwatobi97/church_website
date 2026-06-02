import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../Sidebar";
import MobileBottomNav from "../MobileBottomNav";

const DashboardLayout = ({ title = "Dashboard" }) => {
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName") || "Admin";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-emerald-700 text-lg">{title}</span>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <Outlet />
      </main>

      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default DashboardLayout;
