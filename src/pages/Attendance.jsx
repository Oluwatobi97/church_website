import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/history";
import { attendanceAPI } from "../services/api";
import { Loader2 } from "lucide-react";

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

  const [attendance, setAttendance] = useState(createEmptyAttendance());
  const [specialFields, setSpecialFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={36} />
            <p className="text-sm">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Weekly Attendance</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            ❌ {error}
            <button onClick={() => setError(null)} className="ml-3 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* WEEKLY DAYS */}
        {days.map((day) => (
          <div key={day} className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="font-bold mb-3">{day}</h2>

            <div className="grid grid-cols-5 gap-3">
              <input
                placeholder="Adults"
                className="border p-2"
                value={attendance[day].adults}
                disabled={saving}
                onChange={(e) => handleChange(day, "adults", e.target.value)}
              />

              <input
                placeholder="Children"
                className="border p-2"
                value={attendance[day].children}
                disabled={saving}
                onChange={(e) => handleChange(day, "children", e.target.value)}
              />

              <input
                placeholder="Offering"
                className="border p-2"
                value={attendance[day].offering}
                disabled={saving}
                onChange={(e) => handleChange(day, "offering", e.target.value)}
              />

              <input
                placeholder="Newcomers"
                className="border p-2"
                value={attendance[day].newcomers}
                disabled={saving}
                onChange={(e) => handleChange(day, "newcomers", e.target.value)}
              />

              <input
                placeholder="Tithes"
                className="border p-2"
                value={attendance[day].tithes}
                disabled={saving}
                onChange={(e) => handleChange(day, "tithes", e.target.value)}
              />
            </div>
          </div>
        ))}

        {/* SPECIAL PROGRAM */}
        <div className="bg-white p-4 rounded shadow mt-6">
          <h2 className="font-bold mb-3">Special Programs</h2>

          <button
            onClick={addSpecialField}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Create Field
          </button>

          {specialFields.map((item, index) => (
            <div key={index} className="mb-4 border p-3 rounded">
              <input
                placeholder="Program Name (e.g Revival)"
                className="w-full mb-2 p-2 border"
                value={item.name}
                disabled={saving}
                onChange={(e) =>
                  handleSpecialChange(index, "name", e.target.value)
                }
              />

              <div className="grid grid-cols-5 gap-3">
                <input
                  placeholder="Adults"
                  className="border p-2"
                  value={item.adults}
                  disabled={saving}
                  onChange={(e) =>
                    handleSpecialChange(index, "adults", e.target.value)
                  }
                />
                <input
                  placeholder="Children"
                  className="border p-2"
                  value={item.children}
                  disabled={saving}
                  onChange={(e) =>
                    handleSpecialChange(index, "children", e.target.value)
                  }
                />
                <input
                  placeholder="Offering"
                  className="border p-2"
                  value={item.offering}
                  disabled={saving}
                  onChange={(e) =>
                    handleSpecialChange(index, "offering", e.target.value)
                  }
                />
                <input
                  placeholder="Newcomers"
                  className="border p-2"
                  value={item.newcomers}
                  disabled={saving}
                  onChange={(e) =>
                    handleSpecialChange(index, "newcomers", e.target.value)
                  }
                />
                <input
                  placeholder="Tithes"
                  className="border p-2"
                  value={item.tithes}
                  disabled={saving}
                  onChange={(e) =>
                    handleSpecialChange(index, "tithes", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="animate-spin" size={18} />}
          {saving ? "Saving..." : "Submit Attendance"}
        </button>

        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3">Weekly Totals</h2>

          <div className="grid grid-cols-5 gap-3 text-center">
            <div>Adults: {totals.adults}</div>
            <div>Children: {totals.children}</div>
            <div>Offering: {totals.offering}</div>
            <div>Newcomers: {totals.newcomers}</div>
            <div>Tithes: {totals.tithes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
