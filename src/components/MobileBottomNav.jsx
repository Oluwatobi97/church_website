import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Wallet, Calendar, MoreVertical } from "lucide-react";

const MobileBottomNav = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
    { icon: Users, label: "Attendance", path: "/dashboard/attendance" },
    { icon: Wallet, label: "Finance", path: "/dashboard/finance" },
    { icon: Calendar, label: "Timetable", path: "/dashboard/timetable" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/60 backdrop-blur-sm h-20 flex items-center justify-between px-2 shadow-2xl shadow-black/5">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || location.pathname === `/dashboard${tab.path}`;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-300 rounded-2xl mx-1 ${
              isActive 
                ? "text-emerald-600 bg-emerald-50" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${
              isActive ? "bg-emerald-100" : "bg-gray-100"
            }`}>
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300 rounded-2xl mx-1"
      >
        <div className="p-2 rounded-xl bg-gray-100">
          <MoreVertical size={20} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold tracking-wide">More</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;