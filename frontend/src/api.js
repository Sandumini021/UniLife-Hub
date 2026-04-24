// Prefer explicit env var. Otherwise, in development call backend directly
// (avoids needing to restart CRA for proxy changes). In production, use relative.
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

async function request(path, options) {
  const controller = new AbortController();
  const timeoutMs = 12000;
  const t = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options && options.headers ? options.headers : {}) },
      signal: controller.signal,
      ...options,
    });
  } catch (e) {
    if (e && typeof e === "object" && e.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running on port 5000?");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data && typeof data === "object" && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export function getWellbeingHabits(date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return request(`/api/wellbeing/habits${qs}`);
}

export function addWellbeingHabit(payload) {
  return request("/api/wellbeing/habits", { method: "POST", body: JSON.stringify(payload) });
}

export function getWellbeingCheckin(date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return request(`/api/wellbeing/checkin${qs}`);
}

export function saveWellbeingCheckin(payload) {
  return request("/api/wellbeing/checkin", { method: "POST", body: JSON.stringify(payload) });
}

export function deleteWellbeingCheckin(date) {
  if (!date) return request("/api/wellbeing/checkin", { method: "DELETE" });
  const encoded = encodeURIComponent(date);
  // Prefer clean path param; fallback to querystring for older backends.
  return request(`/api/wellbeing/checkin/${encoded}`, { method: "DELETE" }).catch((e) => {
    const msg = e && typeof e.message === "string" ? e.message : "";
    if (msg.includes("(404)")) {
      return request(`/api/wellbeing/checkin?date=${encoded}`, { method: "DELETE" });
    }
    throw e;
  });
}

export function getWellbeingReminders() {
  return request("/api/wellbeing/reminders");
}

export function saveWellbeingReminders(payload) {
  return request("/api/wellbeing/reminders", { method: "POST", body: JSON.stringify(payload) });
}

export function getWellbeingTimerSessions(limit) {
  const qs = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  return request(`/api/wellbeing/timer-sessions${qs}`);
}

export function saveWellbeingTimerSession(payload) {
  return request("/api/wellbeing/timer-sessions", { method: "POST", body: JSON.stringify(payload) });
}

// Task Manager
export function getTaskCategories() {
  return request("/api/tasks/categories");
}

export function createTaskCategory(payload) {
  return request("/api/tasks/categories", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTaskCategory(id, payload) {
  return request(`/api/tasks/categories/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTaskCategory(id) {
  return request(`/api/tasks/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getCategoryTasks(categoryId) {
  return request(`/api/tasks/categories/${encodeURIComponent(categoryId)}/tasks`);
}

export function createCategoryTask(categoryId, payload) {
  return request(`/api/tasks/categories/${encodeURIComponent(categoryId)}/tasks`, { method: "POST", body: JSON.stringify(payload) });
}

export function reorderCategoryTasks(categoryId, tasks) {
  return request(`/api/tasks/categories/${encodeURIComponent(categoryId)}/tasks/reorder`, {
    method: "PUT",
    body: JSON.stringify({ tasks }),
  });
}
export function updateCategoryTaskApi(taskId, payload) {
  return request(`/api/tasks/tasks/${encodeURIComponent(taskId)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteCategoryTaskApi(taskId) {
  return request(`/api/tasks/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" });
}

export function getCountdowns() {
  return request("/api/tasks/countdowns");
}

export function createCountdown(payload) {
  return request("/api/tasks/countdowns", { method: "POST", body: JSON.stringify(payload) });
}

export function updateCountdown(id, payload) {
  return request(`/api/tasks/countdowns/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteCountdown(id) {
  return request(`/api/tasks/countdowns/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function reorderCountdowns(list) {
  return request("/api/tasks/countdowns/reorder", { method: "PUT", body: JSON.stringify({ list }) });
}

// Expense Tracker (Finance)
export function getTransactions(params) {
  const qs =
    params && params.fromISO && params.toISO
      ? `?fromISO=${encodeURIComponent(params.fromISO)}&toISO=${encodeURIComponent(params.toISO)}`
      : "";
  return request(`/api/finance/transactions${qs}`);
}

export function createTransaction(payload) {
  return request("/api/finance/transactions", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTransaction(id, payload) {
  return request(`/api/finance/transactions/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTransactionApi(id) {
  return request(`/api/finance/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// Academic Progress Tracking
export function getAcademicBootstrap() {
  return request("/api/academic/bootstrap");
}

export function createAcademicSubject(payload) {
  return request("/api/academic/subjects", { method: "POST", body: JSON.stringify(payload) });
}

export function deleteAcademicSubject(id) {
  return request(`/api/academic/subjects/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function createAcademicMark(payload) {
  return request("/api/academic/marks", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAcademicMark(id, payload) {
  return request(`/api/academic/marks/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteAcademicMark(id) {
  return request(`/api/academic/marks/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function saveAcademicTrackerSettings(payload) {
  return request("/api/academic/settings", { method: "POST", body: JSON.stringify(payload) });
}

export function getStudyResources() {
  return request("/api/academic/study-resources");
}

export function createStudyResource(payload) {
  return request("/api/academic/study-resources", { method: "POST", body: JSON.stringify(payload) });
}

export function updateStudyResource(id, payload) {
  return request(`/api/academic/study-resources/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteStudyResource(id) {
  return request(`/api/academic/study-resources/${encodeURIComponent(id)}`, { method: "DELETE" });
}

