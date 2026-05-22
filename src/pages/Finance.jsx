import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Trash2, Plus, RefreshCw, User, Loader2, Save } from "lucide-react";
import { financeAPI, attendanceAPI } from "../services/api";

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
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={36} />
            <p className="text-sm">Loading finance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Finance Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-1">
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
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
            >
              {syncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {syncing ? "Syncing..." : "Sync from Attendance"}
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            ❌ {error}
            <button onClick={() => setError(null)} className="ml-3 underline">
              Dismiss
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
            {successMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold text-sm">
              Total Income
            </h2>
            <p className="text-3xl font-bold text-green-700 mt-1">
              ₦{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold text-sm">
              Total Expenses
            </h2>
            <p className="text-3xl font-bold text-red-700 mt-1">
              ₦{totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold text-sm">
              Balance in Bank
            </h2>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              ₦{balanceInBank.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* INCOME SECTION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-5 text-gray-800">
              Weekly Income
            </h2>

            {/* Auto-synced */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw size={12} /> Auto-synced from Attendance
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  Read-only
                </span>
              </div>
              <div className="space-y-3 pl-3 border-l-2 border-blue-200">
                {Object.entries(autoIncome).map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-700 font-medium text-sm">
                        {category}
                      </p>
                      <p className="text-[10px] text-blue-500 italic">
                        Synced from weekly attendance
                      </p>
                    </div>
                    <div className="w-32 p-2 bg-blue-50 border border-blue-200 rounded text-right text-sm font-semibold text-blue-700">
                      ₦{(parseFloat(amount) || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual income */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <User size={12} /> Manually Entered
              </h3>
              <div className="space-y-3 pl-3 border-l-2 border-gray-200">
                {manualIncome.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex justify-between items-center"
                  >
                    <label className="text-gray-700 font-medium text-sm">
                      {item.category}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.amount}
                      onChange={(e) => {
                        const updated = [...manualIncome];
                        updated[index].amount = e.target.value;
                        setManualIncome(updated);
                      }}
                      disabled={!isEditable}
                      className="w-32 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-400 outline-none disabled:bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Balance Carried Down */}
            <div className="mb-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-semibold text-sm">
                  Balance Carried Down
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={balanceCarriedDown}
                  onChange={(e) =>
                    setBalanceCarriedDown(parseFloat(e.target.value) || 0)
                  }
                  disabled={!isEditable}
                  className="w-32 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-400 outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Save button */}
            {isEditable && (
              <button
                onClick={saveManualIncome}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium mb-4"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Income"}
              </button>
            )}

            {/* Total income */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">
                  Total Income
                </span>
                <span className="text-xl font-bold text-green-700">
                  ₦{totalIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* EXPENSES SECTION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Expenses
            </h2>

            {/* Add Expense Form */}
            {isEditable && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  Add New Expense
                </h3>
                <div className="flex gap-2">
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-400 outline-none"
                  >
                    <option value="">Select Category</option>
                    {expenseCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-28 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-400 outline-none"
                  />
                  <button
                    onClick={handleAddExpense}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 flex items-center gap-1 font-medium"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        {expense.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₦{parseFloat(expense.amount).toLocaleString()}
                      </p>
                    </div>
                    {isEditable && (
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No expenses recorded this week</p>
                </div>
              )}
            </div>

            {/* Total expenses */}
            <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-sm">
                  Total Expenses
                </span>
                <span className="text-xl font-bold text-red-700">
                  ₦{totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Only Message */}
        {!isEditable && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
            💡 You have view-only access. Contact an Admin or Council member to
            edit finance data.
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
