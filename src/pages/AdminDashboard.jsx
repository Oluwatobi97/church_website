import React from "react";
import Sidebar from "./Sidebar";
import Card from "../components/ui/Card";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>Total Members: 120</Card>
          <Card>Active Devotions: 5</Card>
          <Card>Recent History Logs: 12</Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
