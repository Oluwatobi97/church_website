import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Devotion from "../pages/Devotion";
import Timetable from "../pages/Timetable";
import Attendance from "../pages/Attendance";
import Announcements from "../pages/Announcements";
import History from "../pages/History";
import Finance from "../pages/Finance";
import Reports from "../pages/Reports";
import About from "../pages/About";
import Contact from "../pages/Contact";
import PublicLayout from "../components/layouts/PublicLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DevotionPublic from "../pages/public/DevotionPublic";
import AnnouncementsPublic from "../pages/public/AnnouncementsPublic";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/devotion" element={<DevotionPublic />} />
          <Route
            path="/daily-devotion"
            element={<Navigate to="/devotion" replace />}
          />
          <Route path="/announcements" element={<AnnouncementsPublic />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "council", "member"]} />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/devotion" element={<Devotion />} />
            <Route
              path="/dashboard/announcements"
              element={<Announcements />}
            />
            <Route path="/dashboard/attendance" element={<Attendance />} />
            <Route path="/dashboard/finance" element={<Finance />} />
            <Route path="/dashboard/timetable" element={<Timetable />} />
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
