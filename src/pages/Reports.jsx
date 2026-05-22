import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { financeAPI, attendanceAPI } from "../services/api";

const Reports = () => {
  const userRole = localStorage.getItem("userRole");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get church schedule (static or from timetable data)
  const getChurchSchedule = () => {
    return [
      { day: "Tuesday", time: "6:00 AM", programme: "Prayers" },
      { day: "Friday", time: "6:00 AM", programme: "Intercession" },
      { day: "Sunday", time: "9:00 AM", programme: "Main Service" },
    ];
  };

  // Load all report data from backend APIs
  const loadReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [incomeRes, expensesRes, balanceRes, attendanceRes] =
        await Promise.all([
          financeAPI.getIncome(),
          financeAPI.getExpenses(),
          financeAPI.getBalance(),
          attendanceAPI.getAll(),
        ]);

      const incomeRecords = incomeRes?.data || incomeRes || [];
      const expenseRecords = expensesRes?.data || expensesRes || [];
      const balanceRecords = balanceRes?.data || balanceRes || [];
      const attendanceRecords = attendanceRes?.data || attendanceRes || [];

      // Calculate Finance Summary
      const totalIncome = incomeRecords.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
      );
      const totalExpenses = expenseRecords.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
      );
      const carriedDown = balanceRecords.reduce(
        (sum, item) => sum + (parseFloat(item.balance_carried_down) || 0),
        0,
      );
      const balanceInBank = totalIncome - totalExpenses + carriedDown;

      const financeSummary = {
        incomeBreakdown: incomeRecords.map((item) => ({
          category: item.category,
          amount: parseFloat(item.amount) || 0,
        })),
        expensesBreakdown: expenseRecords.map((item) => ({
          category: item.category,
          amount: parseFloat(item.amount) || 0,
        })),
        totalIncome,
        totalExpenses,
        carriedDown,
        balanceInBank,
      };

      // Calculate Attendance Averages
      const standardDays = ["Tuesday", "Friday", "Sunday"];
      const attendanceAggregates = {};

      standardDays.forEach((day) => {
        attendanceAggregates[day] = { adultsSum: 0, childrenSum: 0, count: 0 };
      });

      attendanceRecords.forEach((record) => {
        const day = record.day;
        // Only consider standard days for averages
        if (standardDays.includes(day)) {
          attendanceAggregates[day].adultsSum +=
            parseFloat(record.total_adults) || 0;
          attendanceAggregates[day].childrenSum +=
            parseFloat(record.total_children) || 0;
          attendanceAggregates[day].count++;
        }
      });

      const averagedAttendance = standardDays.map((day) => {
        const { adultsSum, childrenSum, count } = attendanceAggregates[day];
        const adults = count > 0 ? Math.round(adultsSum / count) : 0;
        const children = count > 0 ? Math.round(childrenSum / count) : 0;
        return {
          day,
          adults,
          children,
          total: adults + children,
        };
      });

      // Get static schedule
      const schedule = getChurchSchedule();

      setReportData({
        generatedDate: new Date().toLocaleDateString(),
        schedule,
        attendance: averagedAttendance,
        finance: financeSummary,
      });
    } catch (err) {
      console.error("Report Error:", err);
      setError(err.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
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
      XLSX.utils.book_append_sheet(wb, financeSummarySheet, "Finance Summary");

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
    loadReportData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={36} />
            <p className="text-sm">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg
                onClick={() => setError(null)}
                className="fill-current h-6 w-6 text-red-500 cursor-pointer"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Comprehensive Reports</h1>
          <div className="flex gap-3">
            <button
              onClick={loadReportData}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              Refresh
            </button>

            {(userRole === "admin" || userRole === "council") && (
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                disabled={!reportData}
              >
                <Download size={18} />
                Export to Excel
              </button>
            )}
          </div>
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
                        <td className="border p-3 text-center">
                          {item.adults}
                        </td>
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
                        {reportData.finance.incomeBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border p-3">{item.category}</td>
                            <td className="border p-3 text-right">
                              ₦{parseFloat(item.amount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
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
                          ),
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
