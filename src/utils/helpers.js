export const getFormattedDate = () => {
  const now = new Date();
  const dayName = now.toLocaleString("en-US", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  return `${dayName}, ${date} ${month} ${year}`;
};

/**
 * Saves a history entry to localStorage.
 *
 * @param {string} type - The category (e.g., 'timetable', 'devotion', 'announcement', 'attendance')
 * @param {string} action - The action performed (e.g., 'added', 'edited', 'deleted', 'saved')
 * @param {string} description - A string describing what happened
 */
export const saveToHistory = (type, action, description) => {
  try {
    // Retrieve existing history or initialize empty array
    const history = JSON.parse(localStorage.getItem("history") || "[]");

    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });
    const newEntry = {
      type: type.toLowerCase(),
      action: action,
      description: description,
      date: getFormattedDate(), // Use the new helper function
      month: currentMonth,
    };

    // Add new entry to the beginning of the list
    history.unshift(newEntry);

    // Persist to localStorage, limiting to the last 100 entries
    localStorage.setItem("history", JSON.stringify(history.slice(0, 100)));
  } catch (error) {
    console.error("Failed to save history entry:", error);
  }
};
