export const getFormattedDate = () => {
  const now = new Date();

  const dayName = now.toLocaleString("en-US", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();

  return `${dayName}, ${date} ${month} ${year}`;
};

export const saveToHistory = (type, data) => {
  const existing = JSON.parse(localStorage.getItem("history")) || [];

  const newRecord = {
    type,
    data,
    date: getFormattedDate(),
  };

  existing.unshift(newRecord);
  localStorage.setItem("history", JSON.stringify(existing));
};
