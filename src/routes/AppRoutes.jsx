import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Devotion from "../pages/Devotion";
import Timetable from "../pages/Timetable";
import Attendance from "../pages/Attendance";
import Announcements from "../pages/Announcements";
import History from "../pages/History";
import Finance from "../pages/Finance";
import Reports from "../pages/Reports";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devotion" element={<Devotion />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/history" element={<History />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
