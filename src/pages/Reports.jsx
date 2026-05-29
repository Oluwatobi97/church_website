import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  RefreshCw,
  Menu,
  Wallet,
  TrendingDown,
  TrendingUp,
  Landmark,
  Users,
  Calendar,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import { financeAPI, attendanceAPI } from "../services/api";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  gradient,
  delay,
  prefix = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient}`}
  >
    <div className="absolute -right-3 -top-3 opacity-10">
      <Icon size={90} />
    </div>
    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
      <Icon size={20} />
    </div>
    <p className="text-2xl lg:text-3xl font-bold">
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
    </p>
    <p className="text-white/75 text-xs mt-1 font-medium uppercase tracking-wider">
      {label}
    </p>
  </motion.div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  emoji,
  children,
  delay = 0,
  accentColor = "emerald",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div
      className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3`}
    >
      <div className={`w-1 h-6 rounded-full bg-${accentColor}-500`} />
      <h2 className="text-base font-bold text-gray-900">
        {emoji} {title}
      </h2>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </motion.div>
);

// ─── Table ────────────────────────────────────────────────────────────────────
const Table = ({
  headers,
  rows,
  headerBg = "bg-emerald-50",
  headerText = "text-emerald-700",
  totalRow = null,
}) => (
  <table className="w-full min-w-[400px]">
    <thead>
      <tr className={headerBg}>
        {headers.map((h, i) => (
          <th
            key={i}
            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${headerText}`}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {rows.map((row, i) => (
        <tr
          key={i}
          className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
        >
          {row.map((cell, j) => (
            <td
              key={j}
              className={`px-6 py-4 text-sm text-gray-700 ${j > 0 ? "text-right font-medium" : ""}`}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
      {totalRow && (
        <tr className={`${headerBg} font-bold`}>
          {totalRow.map((cell, j) => (
            <td
              key={j}
              className={`px-6 py-4 text-sm ${headerText} ${j > 0 ? "text-right" : ""}`}
            >
              {cell}
            </td>
          ))}
        </tr>
      )}
    </tbody>
  </table>
);

// ─── Reports ──────────────────────────────────────────────────────────────────
const Reports = () => {
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Admin";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getChurchSchedule = () => [
    { day: "Tuesday", time: "6:00 AM", programme: "Prayers" },
    { day: "Friday", time: "6:00 AM", programme: "Intercession" },
    { day: "Sunday", time: "9:00 AM", programme: "Main Service" },
  ];

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

      const standardDays = ["Tuesday", "Friday", "Sunday"];
      const attendanceAggregates = {};
      standardDays.forEach((day) => {
        attendanceAggregates[day] = { adultsSum: 0, childrenSum: 0, count: 0 };
      });
      attendanceRecords.forEach((record) => {
        if (standardDays.includes(record.day)) {
          attendanceAggregates[record.day].adultsSum +=
            parseFloat(record.total_adults) || 0;
          attendanceAggregates[record.day].childrenSum +=
            parseFloat(record.total_children) || 0;
          attendanceAggregates[record.day].count++;
        }
      });

      const averagedAttendance = standardDays.map((day) => {
        const { adultsSum, childrenSum, count } = attendanceAggregates[day];
        const adults = count > 0 ? Math.round(adultsSum / count) : 0;
        const children = count > 0 ? Math.round(childrenSum / count) : 0;
        return { day, adults, children, total: adults + children };
      });

      setReportData({
        generatedDate: new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        schedule: getChurchSchedule(),
        attendance: averagedAttendance,
        finance: financeSummary,
      });
    } catch (err) {
      setError(err.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const scheduleData = [
        ["CHURCH SCHEDULE"],
        [],
        ["Day", "Time", "Programme"],
        ...reportData.schedule.map((s) => [s.day, s.time, s.programme]),
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(scheduleData),
        "Schedule",
      );

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
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(attendanceData),
        "Attendance",
      );

      const financeSummaryData = [
        ["FINANCE SUMMARY"],
        [],
        ["Total Income", reportData.finance.totalIncome || 0],
        ["Total Expenses", reportData.finance.totalExpenses || 0],
        ["Balance Carried Down", reportData.finance.carriedDown || 0],
        ["Balance in Bank", reportData.finance.balanceInBank || 0],
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(financeSummaryData),
        "Finance Summary",
      );

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
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.aoa_to_sheet(incomeData),
          "Income Details",
        );
      }

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
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.aoa_to_sheet(expensesData),
          "Expenses Details",
        );
      }

      XLSX.writeFile(
        wb,
        `Church_Report_${new Date().toLocaleDateString()}.xlsx`,
      );
    } catch (error) {
      alert("Error exporting to Excel: " + error.message);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-[250px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="animate-spin text-emerald-600" size={44} />
            <p className="text-sm font-medium">Loading report data...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-[250px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Failed to Load Report
            </h3>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={loadReportData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const hasData =
    reportData?.finance?.totalIncome > 0 ||
    reportData?.finance?.totalExpenses > 0 ||
    reportData?.attendance?.some((a) => a.total > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* ── Mobile Header ──────────────────────────────────────────────── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-emerald-700 text-lg">Reports</span>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
          {/* ── Page Header ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Church Reports
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Generated on {reportData?.generatedDate}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={loadReportData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all shadow-sm"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              {(userRole === "admin" || userRole === "council") && (
                <button
                  onClick={exportToExcel}
                  disabled={!reportData}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-100 disabled:opacity-60"
                >
                  <Download size={16} />
                  Export to Excel
                </button>
              )}
            </div>
          </motion.div>

          {/* ── No Data State ──────────────────────────────────────────────── */}
          {!hasData && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <BarChart3 size={64} className="text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 text-lg mb-2">
                No Report Data Yet
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Data will appear here once attendance and finance records are
                added.
              </p>
            </div>
          )}

          {reportData && (
            <>
              {/* ── Finance Stat Cards ───────────────────────────────────── */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Wallet}
                  label="Total Income"
                  value={reportData.finance.totalIncome}
                  gradient="from-emerald-500 to-emerald-700"
                  delay={0.1}
                  prefix="₦"
                />
                <StatCard
                  icon={TrendingDown}
                  label="Total Expenses"
                  value={reportData.finance.totalExpenses}
                  gradient="from-red-500 to-red-700"
                  delay={0.2}
                  prefix="₦"
                />
                <StatCard
                  icon={ArrowUpRight}
                  label="Balance Carried"
                  value={reportData.finance.carriedDown}
                  gradient="from-amber-500 to-orange-600"
                  delay={0.3}
                  prefix="₦"
                />
                <StatCard
                  icon={Landmark}
                  label="Balance in Bank"
                  value={reportData.finance.balanceInBank}
                  gradient="from-blue-500 to-blue-700"
                  delay={0.4}
                  prefix="₦"
                />
              </section>

              {/* ── Church Schedule ──────────────────────────────────────── */}
              <SectionCard
                title="Church Schedule"
                emoji="📅"
                delay={0.2}
                accentColor="emerald"
              >
                <Table
                  headers={["Day", "Time", "Programme"]}
                  rows={reportData.schedule.map((s) => [
                    s.day,
                    s.time,
                    s.programme,
                  ])}
                  headerBg="bg-emerald-50"
                  headerText="text-emerald-700"
                />
              </SectionCard>

              {/* ── Attendance Summary ───────────────────────────────────── */}
              {reportData.attendance.some((a) => a.total > 0) && (
                <SectionCard
                  title="Attendance Summary (Averages)"
                  emoji="👥"
                  delay={0.3}
                  accentColor="blue"
                >
                  <Table
                    headers={["Day", "Adults", "Children", "Total"]}
                    rows={reportData.attendance.map((a) => [
                      a.day,
                      a.adults.toLocaleString(),
                      a.children.toLocaleString(),
                      a.total.toLocaleString(),
                    ])}
                    headerBg="bg-blue-50"
                    headerText="text-blue-700"
                    totalRow={[
                      "Total",
                      reportData.attendance
                        .reduce((s, a) => s + a.adults, 0)
                        .toLocaleString(),
                      reportData.attendance
                        .reduce((s, a) => s + a.children, 0)
                        .toLocaleString(),
                      reportData.attendance
                        .reduce((s, a) => s + a.total, 0)
                        .toLocaleString(),
                    ]}
                  />
                </SectionCard>
              )}

              {/* ── Finance Breakdown ────────────────────────────────────── */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Income */}
                {reportData.finance.incomeBreakdown?.length > 0 && (
                  <SectionCard
                    title="Income Breakdown"
                    emoji="💰"
                    delay={0.4}
                    accentColor="emerald"
                  >
                    <Table
                      headers={["Category", "Amount"]}
                      rows={reportData.finance.incomeBreakdown.map((item) => [
                        item.category,
                        `₦${item.amount.toLocaleString()}`,
                      ])}
                      headerBg="bg-emerald-50"
                      headerText="text-emerald-700"
                      totalRow={[
                        "Total Income",
                        `₦${reportData.finance.totalIncome.toLocaleString()}`,
                      ]}
                    />
                  </SectionCard>
                )}

                {/* Expenses */}
                {reportData.finance.expensesBreakdown?.length > 0 && (
                  <SectionCard
                    title="Expenses Breakdown"
                    emoji="📊"
                    delay={0.5}
                    accentColor="red"
                  >
                    <Table
                      headers={["Category", "Amount"]}
                      rows={reportData.finance.expensesBreakdown.map((item) => [
                        item.category,
                        `₦${item.amount.toLocaleString()}`,
                      ])}
                      headerBg="bg-red-50"
                      headerText="text-red-700"
                      totalRow={[
                        "Total Expenses",
                        `₦${reportData.finance.totalExpenses.toLocaleString()}`,
                      ]}
                    />
                  </SectionCard>
                )}
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <p className="text-center text-xs text-gray-400 pb-4">
                Report generated on {reportData.generatedDate} • To the glory of
                God
              </p>
            </>
          )}
        </div>
      </main>

      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Reports;
