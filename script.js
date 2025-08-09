(function () {
  "use strict";

  const STORAGE_KEY = "todos_v1";
  const THEME_KEY = "theme_preference";

  const addForm = document.getElementById("addForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const itemsLeft = document.getElementById("itemsLeft");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const filterButtons = Array.from(document.querySelectorAll(".filter"));
  const themeToggleBtn = document.getElementById("themeToggle");

  let tasks = [];
  let currentFilter = "all"; // all | active | completed

  function loadTasksFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        tasks = parsed;
      }
    } catch (err) {
      console.error("Failed to parse tasks from storage", err);
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to save tasks", err);
    }
  }

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.push({ id: generateId(), text: trimmed, completed: false });
    saveTasksToStorage();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasksToStorage();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasksToStorage();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasksToStorage();
    render();
  }

  function setFilter(next) {
    currentFilter = next;
    for (const btn of filterButtons) {
      const isActive = btn.dataset.filter === next;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    }
    render();
  }

  function getFilteredTasks() {
    switch (currentFilter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }

  function updateCounts() {
    const remaining = tasks.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = `task${task.completed ? " task--completed" : ""}`;
    li.dataset.id = task.id;

    const label = document.createElement("label");
    label.className = "task__item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task__checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", task.completed ? "Mark as active" : "Mark as completed");

    const span = document.createElement("span");
    span.className = "task__text";
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task__delete";
    deleteBtn.type = "button";
    deleteBtn.setAttribute("aria-label", `Delete ${task.text}`);
    deleteBtn.textContent = "✕";

    label.appendChild(checkbox);
    label.appendChild(span);

    li.appendChild(label);
    li.appendChild(deleteBtn);

    return li;
  }

  function render() {
    const visible = getFilteredTasks();
    taskList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (const task of visible) {
      fragment.appendChild(createTaskElement(task));
    }
    taskList.appendChild(fragment);
    updateCounts();
  }

  // Theme handling
  function getSystemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      themeToggleBtn.textContent = "☀️";
      themeToggleBtn.setAttribute("aria-pressed", "true");
      themeToggleBtn.title = "Switch to light theme";
    } else {
      root.setAttribute("data-theme", "light");
      themeToggleBtn.textContent = "🌙";
      themeToggleBtn.setAttribute("aria-pressed", "false");
      themeToggleBtn.title = "Switch to dark theme";
    }
  }

  function loadThemePreference() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
      return saved;
    }
    const system = getSystemPrefersDark() ? "dark" : "light";
    applyTheme(system);
    return system;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // Event bindings
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = taskInput.value;
    if (!value.trim()) return;
    addTask(value);
    taskInput.value = "";
    taskInput.focus();
  });

  taskList.addEventListener("click", (e) => {
    const target = e.target;
    const item = target.closest(".task");
    if (!item) return;
    const id = item.dataset.id;

    if (target.matches(".task__delete")) {
      deleteTask(id);
      return;
    }
  });

  taskList.addEventListener("change", (e) => {
    const target = e.target;
    if (target.matches(".task__checkbox")) {
      const item = target.closest(".task");
      if (!item) return;
      toggleTask(item.dataset.id);
    }
  });

  for (const btn of filterButtons) {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  }

  clearCompletedBtn.addEventListener("click", clearCompleted);
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Init
  loadTasksFromStorage();
  loadThemePreference();
  render();
})();