import Sidebar from "./Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    saveToHistory("Timetable", schedule);
    setShowPreview(true);
    alert("Timetable saved locally ✅");
  };

  const handleEdit = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Timetable</h1>
            <p className="text-gray-600">Month: {month}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Monthly Timetable
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Dashboard
            </button>

            <button
              onClick={() => setShowPreview((v) => !v)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showPreview ? "Hide user view" : "View as user"}
            </button>

            <button
              onClick={() => {
                setMonth(currentMonth);
                setSchedule(generateMonthlyTimetable(currentMonth));
                setShowPreview(false);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded"
            >
              Reset month
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">User view preview</h2>
            <div className="bg-white rounded-xl shadow p-4">
              {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(
                (week) => (
                  <div key={`preview-${week}`} className="mb-5 last:mb-0">
                    <h3 className="font-semibold mb-2">{week}</h3>

                    <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-gray-500 pb-2 border-b">
                      <div>Day</div>
                      <div>Minister</div>
                      <div>Role</div>
                    </div>

                    <div className="mt-2 space-y-2">
                      {schedule.map((item, index) =>
                        item.week === week ? (
                          <div
                            key={`preview-${week}-${item.day}-${index}`}
                            className="grid grid-cols-3 gap-3"
                          >
                            <div className="font-medium">{item.day}</div>
                            <div className="text-gray-800">
                              {item.minister?.trim() ? item.minister : "—"}
                            </div>
                            <div className="text-gray-800">
                              {item.role?.trim() ? item.role : "—"}
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((week) => (
          <div key={week} className="mb-6">
            <h2 className="font-bold text-lg mb-2">{week}</h2>

            <div className="bg-white p-4 rounded shadow">
              {schedule.map((item, index) =>
                item.week === week ? (
                  <div
                    key={`${item.month}-${item.week}-${item.day}-${index}`}
                    className="grid grid-cols-3 gap-4 mb-2 items-center"
                  >
                    <div className="font-medium">{item.day}</div>

                    <input
                      value={item.minister}
                      onChange={(e) =>
                        handleEdit(index, "minister", e.target.value)
                      }
                      placeholder="Minister"
                      className="border p-2 rounded"
                    />

                    <input
                      value={item.role}
                      onChange={(e) =>
                        handleEdit(index, "role", e.target.value)
                      }
                      placeholder="Role"
                      className="border p-2 rounded"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
