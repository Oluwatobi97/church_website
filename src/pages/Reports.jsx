import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";

const Reports = () => {
  const userRole = localStorage.getItem("userRole");
  const [reportData, setReportData] = useState(null);

  // Get church schedule (static or from timetable data)
  const getChurchSchedule = () => {
    return [
      { day: "Tuesday", time: "6:00 AM", programme: "Prayers" },
      { day: "Friday", time: "6:00 AM", programme: "Intercession" },
      { day: "Sunday", time: "9:00 AM", programme: "Main Service" },
    ];
  };

  // Calculate attendance averages
  const getAttendanceAverages = () => {
    try {
      const saved = localStorage.getItem("attendance");
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const days = ["Tuesday", "Friday", "Sunday"];

      const averages = days.map((day) => {
        const dayData = parsed.attendance?.[day];
        const adults = parseInt(dayData?.adults) || 0;
        const children = parseInt(dayData?.children) || 0;
        const total = adults + children;

        return {
          day,
          adults,
          children,
          total,
        };
      });

      return averages;
    } catch {
      return null;
    }
  };

  // Get income and expense summary
  const getFinanceSummary = () => {
    try {
      const income = localStorage.getItem("financeIncome");
      const expenses = localStorage.getItem("financeExpenses");
      const balance = localStorage.getItem("financeBalance");

      const incomeData = income ? JSON.parse(income) : [];
      const expenseData = expenses ? JSON.parse(expenses) : [];

      const totalIncome = incomeData.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      const totalExpenses = expenseData.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );

      const carriedDown = parseFloat(balance) || 0;

      return {
        incomeBreakdown: incomeData,
        expensesBreakdown: expenseData,
        totalIncome,
        totalExpenses,
        carriedDown,
        balanceInBank: totalIncome - totalExpenses + carriedDown,
      };
    } catch {
      return null;
    }
  };

  // Generate report data
  const generateReport = () => {
    const schedule = getChurchSchedule();
    const attendance = getAttendanceAverages();
    const finance = getFinanceSummary();

    setReportData({
      generatedDate: new Date().toLocaleDateString(),
      schedule,
      attendance: attendance || [],
      finance: finance || {},
    });
  };

  // Export to Excel using SheetJS
  const exportToExcel = async () => {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }

    try {
      const XLSX = await import("xlsx");

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Church Schedule
      const scheduleData = [
        ["CHURCH SCHEDULE"],
        [],
        ["Day", "Time", "Programme"],
        ...reportData.schedule.map((s) => [s.day, s.time, s.programme]),
      ];
      const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
      XLSX.utils.book_append_sheet(wb, scheduleSheet, "Schedule");

      // Sheet 2: Attendance Summary
      const attendanceData = [
        ["ATTENDANCE SUMMARY"],
        [],
        ["Day", "Adults", "Children", "Total"],
        ...reportData.attendance.map((a) => [
          a.day,
          a.adults,
          a.children,
          a.total,
        ]),
      ];
      const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, attendanceSheet, "Attendance");

      // Sheet 3: Finance Summary
      const financeSummaryData = [
        ["FINANCE SUMMARY"],
        [],
        ["Total Income", reportData.finance.totalIncome || 0],
        ["Total Expenses", reportData.finance.totalExpenses || 0],
        ["Balance Carried Down", reportData.finance.carriedDown || 0],
        ["Balance in Bank", reportData.finance.balanceInBank || 0],
      ];
      const financeSummarySheet = XLSX.utils.aoa_to_sheet(financeSummaryData);
      XLSX.utils.book_append_sheet(
        wb,
        financeSummarySheet,
        "Finance Summary"
      );

      // Sheet 4: Detailed Income
      if (reportData.finance.incomeBreakdown?.length > 0) {
        const incomeData = [
          ["INCOME BREAKDOWN"],
          [],
          ["Category", "Amount"],
          ...reportData.finance.incomeBreakdown.map((item) => [
            item.category,
            item.amount,
          ]),
        ];
        const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
        XLSX.utils.book_append_sheet(wb, incomeSheet, "Income Details");
      }

      // Sheet 5: Detailed Expenses
      if (reportData.finance.expensesBreakdown?.length > 0) {
        const expensesData = [
          ["EXPENSES BREAKDOWN"],
          [],
          ["Category", "Amount"],
          ...reportData.finance.expensesBreakdown.map((item) => [
            item.category,
            item.amount,
          ]),
        ];
        const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
        XLSX.utils.book_append_sheet(wb, expensesSheet, "Expenses Details");
      }

      // Download
      XLSX.writeFile(wb, `Church_Report_${reportData.generatedDate}.xlsx`);
    } catch (error) {
      alert("Error exporting to Excel: " + error.message);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={18} />
            Export to Excel
          </button>
        </div>

        {reportData && (
          <div className="space-y-6">
            {/* Church Schedule */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">📅 Church Schedule</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Day</th>
                    <th className="border p-3 text-left">Time</th>
                    <th className="border p-3 text-left">Programme</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.schedule.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-3">{item.day}</td>
                      <td className="border p-3">{item.time}</td>
                      <td className="border p-3">{item.programme}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Summary */}
            {reportData.attendance.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">
                  👥 Attendance Summary
                </h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">Day</th>
                      <th className="border p-3 text-center">Adults</th>
                      <th className="border p-3 text-center">Children</th>
                      <th className="border p-3 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.attendance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-3">{item.day}</td>
                        <td className="border p-3 text-center">{item.adults}</td>
                        <td className="border p-3 text-center">
                          {item.children}
                        </td>
                        <td className="border p-3 text-center font-semibold">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Finance Summary */}
            {reportData.finance && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                    <p className="text-sm text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₦{reportData.finance.totalIncome?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-700">
                      ₦{reportData.finance.totalExpenses?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                    <p className="text-sm text-gray-600">Balance Carried</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      ₦{reportData.finance.carriedDown?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                    <p className="text-sm text-gray-600">Balance in Bank</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ₦{reportData.finance.balanceInBank?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Income Breakdown */}
                {reportData.finance.incomeBreakdown?.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">
                      💰 Income Breakdown
                    </h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">Category</th>
                          <th className="border p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.finance.incomeBreakdown.map(
                          (item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border p-3">{item.category}</td>
                              <td className="border p-3 text-right">
                                ₦{parseFloat(item.amount || 0).toLocaleString()}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Expenses Breakdown */}
                {reportData.finance.expensesBreakdown?.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">
                      📊 Expenses Breakdown
                    </h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">Category</th>
                          <th className="border p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.finance.expensesBreakdown.map(
                          (item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border p-3">{item.category}</td>
                              <td className="border p-3 text-right">
                                ₦{parseFloat(item.amount || 0).toLocaleString()}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Generated Info */}
            <div className="text-sm text-gray-500 text-center mt-6">
              Report generated on: {reportData.generatedDate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
