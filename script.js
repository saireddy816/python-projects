(function () {
  'use strict';

  const LOCAL_STORAGE_KEY = 'simple_todo_tasks_v1';

  /** @type {Array<{id:string, title:string, completed:boolean}>} */
  let tasks = [];

  const form = document.getElementById('new-task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const countLabel = document.getElementById('task-count');
  const clearCompletedButton = document.getElementById('clear-completed');

  document.addEventListener('DOMContentLoaded', initializeApp);

  function initializeApp() {
    tasks = loadTasks();
    renderTasks();
    form.addEventListener('submit', onFormSubmit);
    clearCompletedButton.addEventListener('click', onClearCompleted);
  }

  function onFormSubmit(event) {
    event.preventDefault();
    const title = input.value.trim();
    if (title.length === 0) {
      input.focus();
      return;
    }
    addTask(title);
    input.value = '';
    input.focus();
  }

  function onClearCompleted() {
    const hasCompleted = tasks.some((t) => t.completed);
    if (!hasCompleted) return;
    tasks = tasks.filter((t) => !t.completed);
    persistTasks();
    renderTasks();
  }

  function addTask(title) {
    const task = {
      id: generateId(),
      title,
      completed: false,
    };
    tasks.unshift(task);
    persistTasks();
    renderTasks();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    persistTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    persistTasks();
    renderTasks();
  }

  function renderTasks() {
    list.innerHTML = '';

    if (tasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-item';
      empty.innerHTML = '<span class="task-title" style="color: var(--muted)">Nothing here yet. Add your first task!</span>';
      list.appendChild(empty);
    } else {
      for (const task of tasks) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute(
          'aria-label',
          `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`
        );
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const title = document.createElement('div');
        title.className = 'task-title' + (task.completed ? ' completed' : '');
        title.textContent = task.title;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon';
        deleteButton.setAttribute('aria-label', `Delete "${task.title}"`);
        deleteButton.innerHTML = '✕';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(title);
        li.appendChild(deleteButton);
        list.appendChild(li);
      }
    }

    updateCount();
  }

  function updateCount() {
    const remaining = tasks.filter((t) => !t.completed).length;
    const total = tasks.length;
    countLabel.textContent = total === 0 ? '0 items' : `${remaining} of ${total} left`;
  }

  function persistTasks() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidTask);
    } catch {
      return [];
    }
  }

  function isValidTask(value) {
    return (
      value &&
      typeof value.id === 'string' &&
      typeof value.title === 'string' &&
      typeof value.completed === 'boolean'
    );
  }

  function generateId() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
})();