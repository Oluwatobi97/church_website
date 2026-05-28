import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Menu,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import { saveToHistory } from "../utils/helpers.js";

const generateMonthlyTimetable = (month) => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  const days = ["Tuesday", "Friday", "Sunday"];

  const data = [];

  weeks.forEach((week) => {
    days.forEach((day) => {
      data.push({
        month,
        week,
        day,
        minister: "",
        role: "",
      });
    });
  });

  return data;
};

const getCurrentMonth = () => {
  return new Date().toLocaleString("default", { month: "long" });
};

const loadSavedTimetable = () => {
  try {
    const savedData = localStorage.getItem("timetable");
    if (!savedData) return null;

    const parsed = JSON.parse(savedData);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.month !== "string" ||
      !Array.isArray(parsed.schedule)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const Timetable = () => {
  const navigate = useNavigate();
  const currentMonth = getCurrentMonth();
  const saved = loadSavedTimetable();

  const [month, setMonth] = useState(() => saved?.month ?? currentMonth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeWeek, setActiveWeek] = useState("Week 1");
  const userName = localStorage.getItem("userName") || "Admin";
  const [successMsg, setSuccessMsg] = useState("");
  const [schedule, setSchedule] = useState(() => {
    if (saved?.month === currentMonth) return saved.schedule;
    return generateMonthlyTimetable(currentMonth);
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    const data = {
      month,
      schedule,
    };

    localStorage.setItem("timetable", JSON.stringify(data));
    saveToHistory("timetable", "saved", `Timetable for ${month} was saved.`);
    setShowPreview(true);
    setSuccessMsg("Timetable saved successfully! ✅");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleEdit = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-emerald-700 text-lg">Timetable</span>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs font-bold text-emerald-600 mb-2 hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Church Schedule
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Calendar size={16} className="text-emerald-600" /> {month} 2025
              </p>
            </motion.div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={handleSave}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 shrink-0"
              >
                <Save size={18} /> Save
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2.5 rounded-xl font-bold border transition flex items-center gap-2 shrink-0 ${showPreview ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-white text-gray-600 border-gray-200"}`}
              >
                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}{" "}
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={() => {
                  setMonth(currentMonth);
                  setSchedule(generateMonthlyTimetable(currentMonth));
                  setShowPreview(false);
                }}
                className="p-2.5 text-gray-400 hover:text-red-500 transition shrink-0"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {successMsg && (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-2 font-medium"
              >
                <CheckCircle2 size={18} /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Week Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeWeek === week ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
              >
                {week}
              </button>
            ))}
          </div>

          <motion.div
            key={activeWeek + showPreview}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {showPreview ? (
              <div className="divide-y divide-gray-50">
                {schedule
                  .filter((i) => i.week === activeWeek)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 font-bold text-gray-900">
                        <Clock size={16} className="text-emerald-500" />{" "}
                        {item.day}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">
                          {item.minister || "—"}
                        </p>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                          {item.role || "Service"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {schedule.map((item, index) =>
                  item.week === activeWeek ? (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                    >
                      <div className="font-black text-gray-400 uppercase tracking-tighter text-xs">
                        {item.day}
                      </div>
                      <div className="relative">
                        <User
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          value={item.minister}
                          onChange={(e) =>
                            handleEdit(index, "minister", e.target.value)
                          }
                          placeholder="Minister"
                          className="w-full h-10 pl-9 pr-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <input
                        value={item.role}
                        onChange={(e) =>
                          handleEdit(index, "role", e.target.value)
                        }
                        placeholder="Role (e.g. Preacher)"
                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Timetable;
