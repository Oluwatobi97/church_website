import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Devotions</h2>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Attendance</h2>
            <p className="text-2xl font-bold">85</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Timetable</h2>
            <p className="text-2xl font-bold">5</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Announcements</h2>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/devotion")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Devotion
            </button>

            <button
              onClick={() => navigate("/timetable")}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Timetable
            </button>

            <button
              onClick={() => navigate("/announcements")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Add Announcement
            </button>

            <button
              onClick={() => navigate("/attendance")}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              View Attendance
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <ul className="space-y-2">
            <li>📖 New devotion posted</li>
            <li>📢 Announcement updated</li>
            <li>👥 Attendance recorded</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
