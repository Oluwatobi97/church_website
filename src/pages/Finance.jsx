import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToHistory } from "../utils/history";
import { Trash2, Plus } from "lucide-react";

const Finance = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isEditable = userRole === "admin" || userRole === "council";

  // Income categories
  const incomeCategories = [
    "Thanksgiving",
    "Tithe",
    "Worship Offering",
    "Sunday School Offering",
    "Midweek",
  ];

  // Expense categories
  const expenseCategories = [
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
  ];

  // Initialize state
  const [incomeData, setIncomeData] = useState(() => {
    const saved = localStorage.getItem("financeIncome");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return incomeCategories.map((cat) => ({ category: cat, amount: "" }));
      }
    }
    return incomeCategories.map((cat) => ({ category: cat, amount: "" }));
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("financeExpenses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [balanceCarriedDown, setBalanceCarriedDown] = useState(() => {
    const saved = localStorage.getItem("financeBalance");
    return saved ? parseFloat(saved) : 0;
  });

  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  // Save to localStorage and history
  useEffect(() => {
    localStorage.setItem("financeIncome", JSON.stringify(incomeData));
    localStorage.setItem("financeExpenses", JSON.stringify(expenses));
    localStorage.setItem("financeBalance", balanceCarriedDown);
  }, [incomeData, expenses, balanceCarriedDown]);

  // Calculate totals
  const totalIncome = incomeData.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const balanceInBank = totalIncome - totalExpenses + balanceCarriedDown;

  // Handlers
  const handleIncomeChange = (index, amount) => {
    const updated = [...incomeData];
    updated[index].amount = amount;
    setIncomeData(updated);
  };

  const handleAddExpense = () => {
    if (!newExpenseCategory || !newExpenseAmount) {
      alert("Please fill in category and amount");
      return;
    }

    const newExpense = {
      id: Date.now(),
      category: newExpenseCategory,
      amount: parseFloat(newExpenseAmount),
    };

    setExpenses([...expenses, newExpense]);
    setNewExpenseCategory("");
    setNewExpenseAmount("");

    // Track in history
    saveToHistory({
      type: "expense",
      action: "added",
      details: `${newExpenseCategory}: ${newExpenseAmount}`,
    });
  };

  const handleDeleteExpense = (id) => {
    const expense = expenses.find((e) => e.id === id);
    setExpenses(expenses.filter((e) => e.id !== id));

    saveToHistory({
      type: "expense",
      action: "deleted",
      details: `${expense.category}: ${expense.amount}`,
    });
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Finance Tracker</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold">Total Income</h2>
            <p className="text-3xl font-bold text-green-700">
              ₦{totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-700">
              ₦{totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-100 p-5 rounded-xl shadow">
            <h2 className="text-gray-600 font-semibold">Balance in Bank</h2>
            <p className="text-3xl font-bold text-blue-700">
              ₦{balanceInBank.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* INCOME SECTION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Weekly Income</h2>

            <div className="space-y-3">
              {incomeData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    {item.category}
                  </label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleIncomeChange(index, e.target.value)}
                    disabled={!isEditable}
                    className="w-32 p-2 border border-gray-300 rounded disabled:bg-gray-100"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-semibold">
                  Balance Carried Down
                </label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={balanceCarriedDown}
                  onChange={(e) => setBalanceCarriedDown(parseFloat(e.target.value) || 0)}
                  disabled={!isEditable}
                  className="w-32 p-2 border border-gray-300 rounded disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300 bg-green-50 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Income</span>
                <span className="text-xl font-bold text-green-700">
                  ₦{totalIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* EXPENSES SECTION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Expenses</h2>

            {/* Add Expense Form */}
            {isEditable && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold mb-3">Add New Expense</h3>

                <div className="flex gap-2 mb-3">
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map((cat) => (
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
                    className="w-24 p-2 border border-gray-300 rounded text-sm"
                  />

                  <button
                    onClick={handleAddExpense}
                    className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {expense.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₦{expense.amount.toLocaleString()}
                      </p>
                    </div>

                    {isEditable && (
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No expenses recorded
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300 bg-red-50 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">
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
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800">
            💡 You have view-only access. Contact an Admin or Council member to
            edit finance data.
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
