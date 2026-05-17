import Sidebar from "../components/Sidebar";
import { useState } from "react";

const History = () => {
  const [history] = useState(() => JSON.parse(localStorage.getItem("history")) || []);
  const [filter, setFilter] = useState("All");

  const filteredHistory =
    filter === "All" ? history : history.filter((item) => item.type === filter);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">History</h1>

        <div className="flex gap-2 mb-4">
          {["All", "Devotion", "Announcement", "Attendance", "Timetable"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded ${
                  filter === type ? "bg-blue-500 text-white" : "bg-white border"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>

        {filteredHistory.length === 0 && <p>No records found</p>}

        {filteredHistory.map((item, index) => (
          <div key={index} className="bg-white p-4 mb-3 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">{item.type}</h2>
              <span className="text-sm text-gray-500">{item.date}</span>
            </div>

            {item.type === "Devotion" && (
              <div>
                <p className="font-semibold">{item.data.title}</p>
                <p className="text-gray-600">{item.data.content}</p>
              </div>
            )}

            {item.type === "Announcement" && (
              <div>
                <p className="font-semibold">{item.data.title}</p>
                <p className="text-gray-600">{item.data.message}</p>
              </div>
            )}

            {item.type === "Attendance" && (
              <div className="text-sm">
                <p className="font-semibold mb-1">Weekly Summary:</p>

                {Object.entries(item.data.attendance || {}).map(([day, value]) => (
                  <div key={day} className="mb-1">
                    <strong>{day}:</strong> Adults: {value.adults}, Children:{" "}
                    {value.children}, Offering: {value.offering}
                  </div>
                ))}
              </div>
            )}

            {item.type === "Timetable" && (
              <div className="text-sm">
                {(item.data || []).slice(0, 3).map((t, i) => (
                  <p key={i}>
                    {t.week} - {t.day}: {t.minister}
                  </p>
                ))}
                <p className="text-gray-400">...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
