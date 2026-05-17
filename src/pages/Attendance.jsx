import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/history";

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

const getWeekKey = () => {
  const now = new Date();

  const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  return `${firstDay.toDateString()} - ${lastDay.toDateString()}`;
};

const getInitialAttendanceState = () => {
  const base = {
    attendance: createEmptyAttendance(),
    specialFields: [],
  };

  try {
    const saved = localStorage.getItem("attendance");
    if (!saved) return base;

    const parsed = JSON.parse(saved);
    if (parsed.week !== getWeekKey()) return base;

    return {
      attendance: parsed.attendance ?? base.attendance,
      specialFields: parsed.specialFields ?? [],
    };
  } catch {
    return base;
  }
};

const Attendance = () => {
  const navigate = useNavigate();
  const days = ["Tuesday", "Friday", "Sunday"];
  const initialState = getInitialAttendanceState();
  const [attendance, setAttendance] = useState(initialState.attendance);
  const [specialFields, setSpecialFields] = useState(initialState.specialFields);

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

  const handleSubmit = () => {
    const weekKey = getWeekKey();

    const data = {
      week: weekKey,
      attendance,
      specialFields,
    };

    localStorage.setItem("attendance", JSON.stringify(data));
    saveToHistory("Attendance", {
      attendance,
      specialFields,
    });
    alert("Attendance saved successfully ✅");
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

        {/* WEEKLY DAYS */}
        {days.map((day) => (
          <div key={day} className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="font-bold mb-3">{day}</h2>

            <div className="grid grid-cols-5 gap-3">
              <input
                placeholder="Adults"
                className="border p-2"
                value={attendance[day].adults}
                onChange={(e) => handleChange(day, "adults", e.target.value)}
              />

              <input
                placeholder="Children"
                className="border p-2"
                value={attendance[day].children}
                onChange={(e) => handleChange(day, "children", e.target.value)}
              />

              <input
                placeholder="Offering"
                className="border p-2"
                value={attendance[day].offering}
                onChange={(e) => handleChange(day, "offering", e.target.value)}
              />

              <input
                placeholder="Newcomers"
                className="border p-2"
                value={attendance[day].newcomers}
                onChange={(e) => handleChange(day, "newcomers", e.target.value)}
              />

              <input
                placeholder="Tithes"
                className="border p-2"
                value={attendance[day].tithes}
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
                onChange={(e) =>
                  handleSpecialChange(index, "name", e.target.value)
                }
              />

              <div className="grid grid-cols-5 gap-3">
                <input
                  placeholder="Adults"
                  className="border p-2"
                  value={item.adults}
                  onChange={(e) =>
                    handleSpecialChange(index, "adults", e.target.value)
                  }
                />
                <input
                  placeholder="Children"
                  className="border p-2"
                  value={item.children}
                  onChange={(e) =>
                    handleSpecialChange(index, "children", e.target.value)
                  }
                />
                <input
                  placeholder="Offering"
                  className="border p-2"
                  value={item.offering}
                  onChange={(e) =>
                    handleSpecialChange(index, "offering", e.target.value)
                  }
                />
                <input
                  placeholder="Newcomers"
                  className="border p-2"
                  value={item.newcomers}
                  onChange={(e) =>
                    handleSpecialChange(index, "newcomers", e.target.value)
                  }
                />
                <input
                  placeholder="Tithes"
                  className="border p-2"
                  value={item.tithes}
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
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        >
          Submit Attendance
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
