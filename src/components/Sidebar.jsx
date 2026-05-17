import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-semibold">Church Dashboard</h2>
      <ul className="mt-4 space-y-2">
        <li><Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link></li>
        <li><Link to="/devotion" className="hover:text-blue-400">Devotion</Link></li>
        <li><Link to="/timetable" className="hover:text-blue-400">Timetable</Link></li>
        <li><Link to="/attendance" className="hover:text-blue-400">Attendance</Link></li>
        <li><Link to="/announcements" className="hover:text-blue-400">Announcements</Link></li>
        <li><Link to="/finance" className="hover:text-blue-400">Finance</Link></li>
        <li><Link to="/reports" className="hover:text-blue-400">Reports</Link></li>
        <li><Link to="/history" className="hover:text-blue-400">History</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
