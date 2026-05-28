import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Wallet, Calendar, Menu } from "lucide-react";

const MobileBottomNav = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Attendance", path: "/attendance" },
    { icon: Wallet, label: "Finance", path: "/finance" },
    { icon: Calendar, label: "Timetable", path: "/timetable" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 h-16 flex items-center justify-around px-2 shadow-lg">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <tab.icon size={22} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-400"
      >
        <Menu size={22} />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
