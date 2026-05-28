import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Plus,
  X,
  Users,
  Baby,
  Coins,
  Wallet,
  UserPlus,
  Loader2,
  Save,
  Calendar,
} from "lucide-react";
import { saveToHistory } from "../utils/helpers.js";
import { attendanceAPI } from "../services/api";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";

const createEmptyDay = () => ({
  adults: "",
  children: "",
  offering: "",
  newcomers: "",
  tithes: "",
});

const createEmptyAttendance = () => ({
  Tuesday: createEmptyDay(),
  Friday: createEmptyDay(),
  Sunday: createEmptyDay(),
});

const getWeekStarting = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
};

const Attendance = () => {
  const navigate = useNavigate();
  const days = ["Tuesday", "Friday", "Sunday"];
  const weekStarting = getWeekStarting();
  const userName = localStorage.getItem("userName") || "Admin";

  const [attendance, setAttendance] = useState(createEmptyAttendance());
  const [specialFields, setSpecialFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tuesday");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll(weekStarting);
      const records = res?.data || res || [];

      // Map records to state
      const newAttendance = createEmptyAttendance();
      const newSpecials = [];

      records.forEach((rec) => {
        if (rec.special_programme) {
          newSpecials.push({
            id: rec.id,
            name: rec.special_programme,
            adults: rec.total_adults || "",
            children: rec.total_children || "",
            offering: rec.total_offering || "",
            newcomers: rec.total_newcomers || "",
            tithes: rec.total_tithes || "",
          });
        } else if (newAttendance[rec.day]) {
          newAttendance[rec.day] = {
            id: rec.id,
            adults: rec.total_adults || "",
            children: rec.total_children || "",
            offering: rec.total_offering || "",
            newcomers: rec.total_newcomers || "",
            tithes: rec.total_tithes || "",
          };
        }
      });

      setAttendance(newAttendance);
      setSpecialFields(newSpecials);
    } catch (err) {
      setError(
        err.message || "Failed to load attendance records. Please refresh.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (day, field, value) => {
    setAttendance({
      ...attendance,
      [day]: {
        ...attendance[day],
        [field]: value,
      },
    });
  };

  const handleSpecialChange = (index, field, value) => {
    const updated = [...specialFields];
    updated[index][field] = value;
    setSpecialFields(updated);
  };

  const addSpecialField = () => {
    setSpecialFields([
      ...specialFields,
      {
        name: "",
        adults: "",
        children: "",
        offering: "",
        newcomers: "",
        tithes: "",
      },
    ]);
  };

  const removeSpecialField = (index) => {
    const updated = [...specialFields];
    updated.splice(index, 1);
    setSpecialFields(updated);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const promises = [];

      // 1. Loop Tuesday, Friday, Sunday
      days.forEach((day) => {
        const data = attendance[day];
        if (
          data.adults ||
          data.children ||
          data.offering ||
          data.newcomers ||
          data.tithes
        ) {
          promises.push(
            attendanceAPI.create(
              day,
              weekStarting,
              Number(data.adults) || 0,
              Number(data.children) || 0,
              Number(data.offering) || 0,
              Number(data.tithes) || 0,
              Number(data.newcomers) || 0,
              null, // specialProgramme is null for standard days
            ),
          );
        }
      });

      // 2. Prepare special programs
      specialFields.forEach((field) => {
        if (!field.name) return;
        promises.push(
          attendanceAPI.create(
            field.name, // day = programme name per instruction
            weekStarting,
            Number(field.adults) || 0,
            Number(field.children) || 0,
            Number(field.offering) || 0,
            Number(field.tithes) || 0,
            Number(field.newcomers) || 0,
            field.name,
          ),
        );
      });

      await Promise.all(promises);
      saveToHistory("attendance", "saved", "Updated weekly attendance records");
      alert("Attendance saved successfully ✅");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    const totals = {
      adults: 0,
      children: 0,
      offering: 0,
      newcomers: 0,
      tithes: 0,
    };

    Object.values(attendance).forEach((day) => {
      totals.adults += Number(day.adults) || 0;
      totals.children += Number(day.children) || 0;
      totals.offering += Number(day.offering) || 0;
      totals.newcomers += Number(day.newcomers) || 0;
      totals.tithes += Number(day.tithes) || 0;
    });

    specialFields.forEach((item) => {
      totals.adults += Number(item.adults) || 0;
      totals.children += Number(item.children) || 0;
      totals.offering += Number(item.offering) || 0;
      totals.newcomers += Number(item.newcomers) || 0;
      totals.tithes += Number(item.tithes) || 0;
    });

    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-emerald-600">
          <Loader2 className="animate-spin" size={48} />
          <p className="text-sm font-medium text-gray-500">
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-emerald-700 text-lg">Attendance</span>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
          {/* Page Header (Desktop) */}
          <div className="hidden lg:flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">
                Weekly Attendance
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1 font-medium">
                <Calendar size={16} className="text-emerald-600" />
                Week Starting:{" "}
                {new Date(weekStarting).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </motion.div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Submit Records
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, x: [0, -10, 10, -10, 10, 0] }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <span className="font-medium">❌ {error}</span>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setActiveTab(day)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeTab === day
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-500"
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Standard Days Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
              {days.map((day, idx) => (
                <DayCard
                  key={day}
                  day={day}
                  data={attendance[day]}
                  idx={idx}
                  handleChange={handleChange}
                  saving={saving}
                />
              ))}
            </div>

            {/* Mobile View Single Day */}
            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <DayCard
                    day={activeTab}
                    data={attendance[activeTab]}
                    handleChange={handleChange}
                    saving={saving}
                    isMobile
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Special Programmes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Special Programmes
                </h2>
                <button
                  onClick={addSpecialField}
                  className="bg-white border border-gray-200 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Plus size={18} /> Add Special Programme
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {specialFields.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group"
                  >
                    <button
                      onClick={() => removeSpecialField(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={20} />
                    </button>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Programme Name
                        </label>
                        <input
                          placeholder="e.g. Revival Service"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-800"
                          value={item.name}
                          disabled={saving}
                          onChange={(e) =>
                            handleSpecialChange(index, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Adults"
                          value={item.adults}
                          onChange={(v) =>
                            handleSpecialChange(index, "adults", v)
                          }
                          disabled={saving}
                          icon={Users}
                        />
                        <InputField
                          label="Children"
                          value={item.children}
                          onChange={(v) =>
                            handleSpecialChange(index, "children", v)
                          }
                          disabled={saving}
                          icon={Baby}
                        />
                        <InputField
                          label="Offering"
                          value={item.offering}
                          onChange={(v) =>
                            handleSpecialChange(index, "offering", v)
                          }
                          disabled={saving}
                          icon={Coins}
                        />
                        <InputField
                          label="Tithes"
                          value={item.tithes}
                          onChange={(v) =>
                            handleSpecialChange(index, "tithes", v)
                          }
                          disabled={saving}
                          icon={Wallet}
                        />
                      </div>
                      <InputField
                        label="Newcomers"
                        value={item.newcomers}
                        onChange={(v) =>
                          handleSpecialChange(index, "newcomers", v)
                        }
                        disabled={saving}
                        icon={UserPlus}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weekly Totals */}
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-bold text-gray-900">Weekly Totals</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <TotalBox
                  label="Adults"
                  value={totals.adults}
                  color="blue"
                  icon={Users}
                />
                <TotalBox
                  label="Children"
                  value={totals.children}
                  color="purple"
                  icon={Baby}
                />
                <TotalBox
                  label="Offering"
                  value={totals.offering}
                  color="emerald"
                  icon={Coins}
                  prefix="₦"
                />
                <TotalBox
                  label="Tithes"
                  value={totals.tithes}
                  color="amber"
                  icon={Wallet}
                  prefix="₦"
                />
                <TotalBox
                  label="Newcomers"
                  value={totals.newcomers}
                  color="rose"
                  icon={UserPlus}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )}
              {saving ? "Saving Records..." : "Submit All Records"}
            </button>
          </motion.div>
        </div>
      </main>

      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

/** ── Helper UI Components ────────────────────────────────────────────────── */

const DayCard = ({
  day,
  data,
  idx = 0,
  handleChange,
  saving,
  isMobile = false,
}) => (
  <motion.div
    initial={!isMobile ? { opacity: 0, y: 20 } : {}}
    animate={!isMobile ? { opacity: 1, y: 0 } : {}}
    transition={{ delay: idx * 0.1 }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-600 space-y-5"
  >
    <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between">
      {day}
      <Users size={18} className="text-emerald-500 opacity-50" />
    </h3>

    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
      <InputField
        label="Total Adults"
        value={data.adults}
        onChange={(v) => handleChange(day, "adults", v)}
        disabled={saving}
        icon={Users}
      />
      <InputField
        label="Total Children"
        value={data.children}
        onChange={(v) => handleChange(day, "children", v)}
        disabled={saving}
        icon={Baby}
      />
      <InputField
        label="Total Offering"
        value={data.offering}
        onChange={(v) => handleChange(day, "offering", v)}
        disabled={saving}
        icon={Coins}
      />
      <InputField
        label="Total Tithes"
        value={data.tithes}
        onChange={(v) => handleChange(day, "tithes", v)}
        disabled={saving}
        icon={Wallet}
      />
    </div>

    <InputField
      label="Total Newcomers"
      value={data.newcomers}
      onChange={(v) => handleChange(day, "newcomers", v)}
      disabled={saving}
      icon={UserPlus}
    />

    {/* Placeholder or visual indicator for special note/programme linkage if needed */}
    <div className="pt-2">
      <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center border-t border-gray-50 pt-3">
        Standard Day Record
      </div>
    </div>
  </motion.div>
);

const InputField = ({ label, value, onChange, disabled, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        type="number"
        placeholder="0"
        className={`w-full ${Icon ? "pl-11" : "px-4"} py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-700`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const TotalBox = ({ label, value, color, icon: Icon, prefix = "" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div
      className={`${colors[color]} p-4 rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="opacity-70" />
        <span className="text-[10px] font-black uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <div className="text-xl font-black">
        {prefix}
        {Number(value).toLocaleString()}
      </div>
    </div>
  );
};

export default Attendance;
