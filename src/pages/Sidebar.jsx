import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const links = [
    {
      name: "Dashboard",
      path: role === "admin" ? "/dashboard" : "/council-dashboard",
      roles: ["admin", "council"],
    },
    {
      name: "Devotion",
      path: "/devotion",
      roles: ["admin", "council", "member"],
    },
    { name: "Timetable", path: "/timetable", roles: ["admin"] },
    { name: "Attendance", path: "/attendance", roles: ["admin", "council"] },
    {
      name: "History",
      path: "/history",
      roles: ["admin", "council", "member"],
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8 text-orange-500">
        Church Manager
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(
            (link) =>
              link.roles.includes(role) && (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block p-3 rounded transition ${
                      location.pathname === link.path
                        ? "bg-orange-600"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ),
          )}
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto w-full bg-red-600 p-3 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
