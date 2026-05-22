const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
let accessToken = localStorage.getItem("accessToken");

export const setAuthToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

const apiCall = async (method, endpoint, data = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (accessToken) {
    options.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
      return null;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "API error");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

// AUTH ENDPOINTS
export const authAPI = {
  register: (name, email, password, role) =>
    apiCall("POST", "/auth/register", { name, email, password, role }),

  login: (email, password) =>
    apiCall("POST", "/auth/login", { email, password }),

  refreshToken: (refreshToken) =>
    apiCall("POST", "/auth/refresh-token", { refreshToken }),
};

// DEVOTION ENDPOINTS
export const devotionAPI = {
  getAll: () => apiCall("GET", "/devotions"),
  getById: (id) => apiCall("GET", `/devotions/${id}`),
  create: (title, content, date) =>
    apiCall("POST", "/devotions", { title, content, date }),
  update: (id, title, content, date) =>
    apiCall("PUT", `/devotions/${id}`, { title, content, date }),
  delete: (id) => apiCall("DELETE", `/devotions/${id}`),
};

// ANNOUNCEMENT ENDPOINTS
export const announcementAPI = {
  getAll: () => apiCall("GET", "/announcements"),
  getById: (id) => apiCall("GET", `/announcements/${id}`),
  create: (title, content, date) =>
    apiCall("POST", "/announcements", { title, content, date }),
  update: (id, title, content, date) =>
    apiCall("PUT", `/announcements/${id}`, { title, content, date }),
  delete: (id) => apiCall("DELETE", `/announcements/${id}`),
};

// ATTENDANCE ENDPOINTS
export const attendanceAPI = {
  getAll: (weekStarting = null) => {
    let url = "/attendance";
    if (weekStarting) url += `?week_starting=${weekStarting}`;
    return apiCall("GET", url);
  },
  getById: (id) => apiCall("GET", `/attendance/${id}`),
  create: (
    day,
    weekStarting,
    totalAdults,
    totalChildren,
    totalOffering,
    totalTithes,
    totalNewcomers,
    specialProgramme,
  ) =>
    apiCall("POST", "/attendance", {
      day,
      week_starting: weekStarting,
      total_adults: totalAdults,
      total_children: totalChildren,
      total_offering: totalOffering,
      total_tithes: totalTithes,
      total_newcomers: totalNewcomers,
      special_programme: specialProgramme,
    }),
  update: (
    id,
    day,
    weekStarting,
    totalAdults,
    totalChildren,
    totalOffering,
    totalTithes,
    totalNewcomers,
    specialProgramme,
  ) =>
    apiCall("PUT", `/attendance/${id}`, {
      day,
      week_starting: weekStarting,
      total_adults: totalAdults,
      total_children: totalChildren,
      total_offering: totalOffering,
      total_tithes: totalTithes,
      total_newcomers: totalNewcomers,
      special_programme: specialProgramme,
    }),
  delete: (id) => apiCall("DELETE", `/attendance/${id}`),
};

// TIMETABLE ENDPOINTS
export const timetableAPI = {
  getAll: (month = null, year = null) => {
    let url = "/timetable";
    if (month && year) url += `?month=${month}&year=${year}`;
    return apiCall("GET", url);
  },
  getById: (id) => apiCall("GET", `/timetable/${id}`),
  create: (weekNumber, day, month, year, ministerName) =>
    apiCall("POST", "/timetable", {
      week_number: weekNumber,
      day,
      month,
      year,
      minister_name: ministerName,
    }),
  update: (id, weekNumber, day, month, year, ministerName) =>
    apiCall("PUT", `/timetable/${id}`, {
      week_number: weekNumber,
      day,
      month,
      year,
      minister_name: ministerName,
    }),
  delete: (id) => apiCall("DELETE", `/timetable/${id}`),
};

// FINANCE ENDPOINTS
export const financeAPI = {
  getIncome: (weekStarting = null) => {
    let url = "/finance/income";
    if (weekStarting) url += `?week_starting=${weekStarting}`;
    return apiCall("GET", url);
  },
  getExpenses: (weekStarting = null) => {
    let url = "/finance/expenses";
    if (weekStarting) url += `?week_starting=${weekStarting}`;
    return apiCall("GET", url);
  },
  getBalance: () => apiCall("GET", "/finance/balance"),

  createIncome: (category, amount, weekStarting) =>
    apiCall("POST", "/finance/income", {
      category,
      amount,
      week_starting: weekStarting,
    }),

  createExpense: (category, amount, weekStarting) =>
    apiCall("POST", "/finance/expenses", {
      category,
      amount,
      week_starting: weekStarting,
    }),

  updateIncome: (id, category, amount, weekStarting) =>
    apiCall("PUT", `/finance/income/${id}`, {
      category,
      amount,
      week_starting: weekStarting,
    }),

  updateExpense: (id, category, amount, weekStarting) =>
    apiCall("PUT", `/finance/expenses/${id}`, {
      category,
      amount,
      week_starting: weekStarting,
    }),

  deleteIncome: (id) => apiCall("DELETE", `/finance/income/${id}`),
  deleteExpense: (id) => apiCall("DELETE", `/finance/expenses/${id}`),

  updateBalance: (weekStarting, balanceCarriedDown) =>
    apiCall("PUT", "/finance/balance", {
      week_starting: weekStarting,
      balance_carried_down: balanceCarriedDown,
    }),
};
