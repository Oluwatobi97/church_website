/**
 * Formats the current date into a readable string.
 * Example: "Monday, 10 March 2025"
 */
const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Saves a history entry to localStorage.
 * Supports two calling styles:
 * 1. saveToHistory(type, action, description)
 * 2. saveToHistory({ type, action, details })
 */
export const saveToHistory = (arg1, arg2, arg3) => {
  try {
    let type, action, description;

    if (typeof arg1 === "object" && arg1 !== null) {
      // Style 2: Object based
      type = arg1.type;
      action = arg1.action;
      description = arg1.description || arg1.details || "";
    } else {
      // Style 1: Positional arguments
      type = arg1;
      action = arg2;
      description = arg3;
    }

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    const now = new Date();

    const newEntry = {
      type: String(type || "").toLowerCase(),
      action: String(action || ""),
      description: String(description || ""),
      date: getFormattedDate(),
      month: now.toLocaleString("en-US", { month: "long" }),
    };

    history.unshift(newEntry);
    localStorage.setItem("history", JSON.stringify(history.slice(0, 100)));
  } catch (error) {
    console.error("Failed to save history entry:", error);
  }
};

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem("history") || "[]");
  } catch (error) {
    console.error("Failed to retrieve history:", error);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem("history");
};
