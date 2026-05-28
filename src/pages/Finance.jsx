import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  RefreshCw,
  User,
  Loader2,
  Save,
  Menu,
  Wallet,
  TrendingUp,
  Banknote,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { financeAPI, attendanceAPI } from "../services/api";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";

const Finance = () => {
  const userRole = localStorage.getItem("userRole")?.toLowerCase().trim();
  const isEditable = userRole === "admin" || userRole === "council";

  // Which income categories are auto-synced from attendance
  const autoCategories = ["Worship Offering", "Tithe"];

  const manualIncomeCategories = [
    "Thanksgiving",
    "Sunday School Offering",
    "Midweek",
  ];

  const expenseCategoryOptions = [
    "Signages",
    "Ceiling Tiles",
    "Children Training",
    "Honorarium",
    "Electricals",
    "Gutter",
    "Battery",
    "Herbicides",
    "Zone Support",
    "Windows",
    "Children Camp",
    "Plastic Table",
    "Teenager Camp Support",
    "Transport",
    "Roof Repairs",
    "Grace 2025",
    "Other",
  ];

  // State
  const [autoIncome, setAutoIncome] = useState({
    "Worship Offering": 0,
    Tithe: 0,
  });

  const [manualIncome, setManualIncome] = useState(
    manualIncomeCategories.map((cat) => ({
      category: cat,
      amount: "",
      id: null,
    })),
  );

  const [balanceCarriedDown, setBalanceCarriedDown] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [allIncomeItems, setAllIncomeItems] = useState([]); // New state to store all income items

  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userName = localStorage.getItem("userName") || "Admin";
  const [successMsg, setSuccessMsg] = useState("");

  // Get current week's Monday as week_starting
  const getWeekStarting = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const weekStarting = getWeekStarting();

  // Show success message briefly
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Load all finance data from backend
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeRes, expensesRes, balanceRes] = await Promise.all([
        financeAPI.getIncome(weekStarting),
        financeAPI.getExpenses(weekStarting),
        financeAPI.getBalance(),
      ]);

      // Separate auto and manual income
      setAllIncomeItems(incomeRes?.data || incomeRes || []); // Store all income items
      const incomeList = incomeRes?.data || incomeRes || [];
      const expenseList = expensesRes?.data || expensesRes || [];
      const balanceData = balanceRes?.data || balanceRes;

      // Set auto-synced income
      const newAutoIncome = { "Worship Offering": 0, Tithe: 0 };
      incomeList.forEach((item) => {
        if (autoCategories.includes(item.category)) {
          newAutoIncome[item.category] = parseFloat(item.amount) || 0;
        }
      });
      setAutoIncome(newAutoIncome);

      // Set manual income
      const updatedManual = manualIncomeCategories.map((cat) => {
        const found = incomeList.find((i) => i.category === cat);
        return {
          category: cat,
          amount: found ? parseFloat(found.amount) : "",
          id: found ? found.id : null,
        };
      });
      setManualIncome(updatedManual);

      // Set expenses
      setExpenses(expenseList);

      // Set balance
      if (balanceData) {
        setBalanceCarriedDown(
          parseFloat(balanceData.balance_carried_down) || 0,
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to load finance data. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync from attendance (pull this week's offering + tithes)
  const syncFromAttendance = async () => {
    setSyncing(true);
    try {
      const attendanceRes = await attendanceAPI.getAll(weekStarting);
      const records = attendanceRes?.data || attendanceRes || [];

      // Sum up offering and tithes across all days this week
      let totalOffering = 0;
      let totalTithes = 0;

      records.forEach((record) => {
        totalOffering += parseFloat(record.total_offering) || 0;
        totalTithes += parseFloat(record.total_tithes) || 0;
      });

      const syncPromises = [];
      const existingOffering = allIncomeItems.find(
        (i) => i.category === "Worship Offering",
      );

      if (existingOffering) {
        syncPromises.push(
          financeAPI.updateIncome(
            existingOffering.id,
            "Worship Offering",
            totalOffering,
            weekStarting,
          ),
        );
      } else if (totalOffering > 0) {
        syncPromises.push(
          financeAPI.createIncome(
            "Worship Offering",
            totalOffering,
            weekStarting,
          ),
        );
      }

      const existingTithe = allIncomeItems.find((i) => i.category === "Tithe");
      if (existingTithe) {
        syncPromises.push(
          financeAPI.updateIncome(
            existingTithe.id,
            "Tithe",
            totalTithes,
            weekStarting,
          ),
        );
      } else if (totalTithes > 0) {
        syncPromises.push(
          financeAPI.createIncome("Tithe", totalTithes, weekStarting),
        );
      }

      await Promise.all(syncPromises);
      await loadData();
      showSuccess("✅ Synced from attendance successfully!");
    } catch (err) {
      setError(err.message || "Failed to sync from attendance.");
    } finally {
      setSyncing(false);
    }
  };

  // Save manual income
  const saveManualIncome = async () => {
    setSaving(true);
    try {
      const incomePromises = manualIncome
        .filter(
          (item) =>
            item.amount !== "" &&
            item.amount !== null &&
            !isNaN(parseFloat(item.amount)),
        )
        .map((item) => {
          const amount = parseFloat(item.amount);
          return item.id
            ? financeAPI.updateIncome(
                item.id,
                item.category,
                amount,
                weekStarting,
              )
            : financeAPI.createIncome(item.category, amount, weekStarting);
        });

      await Promise.all([
        ...incomePromises,
        financeAPI.updateBalance(weekStarting, balanceCarriedDown),
      ]);

      await loadData();
      showSuccess("✅ Income saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save income.");
    } finally {
      setSaving(false);
    }
  };

  // Add expense
  const handleAddExpense = async () => {
    if (!newExpenseCategory || !newExpenseAmount) {
      alert("Please select a category and enter an amount.");
      return;
    }
    try {
      await financeAPI.createExpense(
        newExpenseCategory,
        parseFloat(newExpenseAmount),
        weekStarting,
      );
      setNewExpenseCategory("");
      setNewExpenseAmount("");
      await loadData();
      showSuccess("✅ Expense added!");
    } catch (err) {
      setError(err.message || "Failed to add expense.");
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await financeAPI.deleteExpense(id);
      await loadData();
      showSuccess("✅ Expense deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete expense.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate totals
  const autoTotal = Object.values(autoIncome).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0,
  );
  const manualTotal = manualIncome.reduce(
    (sum, i) => sum + (parseFloat(i.amount) || 0),
    0,
  );
  const totalIncome =
    autoTotal + manualTotal + (parseFloat(balanceCarriedDown) || 0);
  const totalExpenses = expenses.reduce(
    (sum, i) => sum + (parseFloat(i.amount) || 0),
    0,
  );
  const balanceInBank = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-emerald-600">
          <Loader2 className="animate-spin" size={48} />
          <p className="text-sm font-medium text-gray-500">
            Loading finance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-[250px] pb-24 lg:pb-8 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
          <span className="font-bold text-emerald-700 text-lg">Finance</span>
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Finance Tracker
              </h1>
              <p className="text-gray-500 mt-1">
                Week of{" "}
                {new Date(weekStarting).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {isEditable && (
              <button
                onClick={syncFromAttendance}
                disabled={syncing}
                className="flex items-center gap-2 bg-white border border-gray-200 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition shadow-sm font-semibold"
              >
                {syncing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                {syncing ? "Syncing..." : "Sync Attendance"}
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="error-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle size={18} /> {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="font-bold hover:underline"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                key="success-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-2 font-medium"
              >
                <CheckCircle2 size={18} /> {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden"
            >
              <Banknote
                className="absolute -right-2 -top-2 opacity-10"
                size={80}
              />
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                Total Income
              </p>
              <p className="text-3xl font-bold mt-1">
                ₦{totalIncome.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden"
            >
              <TrendingUp
                className="absolute -right-2 -top-2 opacity-10"
                size={80}
              />
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                Total Expenses
              </p>
              <p className="text-3xl font-bold mt-1">
                ₦{totalExpenses.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden"
            >
              <Wallet
                className="absolute -right-2 -top-2 opacity-10"
                size={80}
              />
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                In Bank
              </p>
              <p className="text-3xl font-bold mt-1">
                ₦{balanceInBank.toLocaleString()}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* INCOME SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Weekly Income
              </h2>

              <div className="space-y-6">
                {/* Auto-synced */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw size={14} className="text-blue-500" />
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                      Attendance Sync
                    </span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(autoIncome).map(([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center p-3 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl"
                      >
                        <span className="text-sm font-bold text-gray-700">
                          {category}
                        </span>
                        <span className="font-bold text-blue-700">
                          ₦{(parseFloat(amount) || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-gray-400" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Manual Entry
                    </span>
                  </div>
                  <div className="space-y-3">
                    {manualIncome.map((item, index) => (
                      <div
                        key={item.category}
                        className="flex justify-between items-center p-3 bg-gray-50 border-l-4 border-gray-200 rounded-r-xl"
                      >
                        <label className="text-sm font-bold text-gray-700">
                          {item.category}
                        </label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...manualIncome];
                            updated[index].amount = e.target.value;
                            setManualIncome(updated);
                          }}
                          disabled={!isEditable}
                          className="w-32 h-10 px-3 bg-white border border-gray-200 rounded-lg text-right text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-500">
                    Carried Down
                  </label>
                  <input
                    type="number"
                    value={balanceCarriedDown}
                    onChange={(e) =>
                      setBalanceCarriedDown(parseFloat(e.target.value) || 0)
                    }
                    disabled={!isEditable}
                    className="w-32 h-10 px-3 bg-gray-50 border border-gray-100 rounded-lg text-right text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {isEditable && (
                  <button
                    onClick={saveManualIncome}
                    disabled={saving}
                    className="w-full h-12 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}{" "}
                    Save Income
                  </button>
                )}
              </div>
            </div>

            {/* EXPENSES SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Expenses</h2>

              {isEditable && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select Category</option>
                    {expenseCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="flex-1 h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      onClick={handleAddExpense}
                      className="px-6 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition shadow-md shadow-rose-100"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {expense.category}
                        </p>
                        <p className="text-xs text-rose-500 font-bold mt-0.5">
                          ₦{parseFloat(expense.amount).toLocaleString()}
                        </p>
                      </div>
                      {isEditable && (
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400 text-sm font-medium italic">
                    No expenses this week
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Finance;
