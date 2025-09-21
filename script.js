// Select DOM elements
const taskForm = document.getElementById("taskForm");
const taskContainer = document.getElementById("taskContainer");
const searchBox = document.getElementById("searchBox");
const filterPriority = document.getElementById("filterPriority");
const filterStatus = document.getElementById("filterStatus");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const clearAllBtn = document.getElementById("clearAll");
const exportBtn = document.getElementById("exportTasks");
const importBtn = document.getElementById("importBtn");
const importTasks = document.getElementById("importTasks");
const weeklyView = document.getElementById("weeklyView");
const quoteText = document.getElementById("quoteText");
const themeToggle = document.getElementById("themeToggle");

// Load tasks from local storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Motivational Quotes
const quotes = [
  "Success is the sum of small efforts repeated daily.",
  "Do something today that your future self will thank you for.",
  "Study smarter, not harder.",
  "The secret to getting ahead is getting started.",
  "Focus on progress, not perfection."
];
quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render Progress
function renderProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = percent + "%";
  progressText.textContent = `${completed} of ${total} tasks completed (${percent}%)`;
}

// Render Weekly View
function renderWeekly() {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  weeklyView.innerHTML = "";
  days.forEach(day => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${day}</strong><br>`;
    const todayTasks = tasks.filter(t => new Date(t.deadline).getDay() === days.indexOf(day));
    todayTasks.forEach(t => {
      li.innerHTML += `- ${t.title} (${t.category})<br>`;
    });
    weeklyView.appendChild(li);
  });
}

// Render Tasks
function renderTasks() {
  taskContainer.innerHTML = "";
  const searchText = searchBox.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;

  tasks.forEach((task, index) => {
    if (!task.title.toLowerCase().includes(searchText)) return;
    if (priorityFilter !== "All" && task.priority !== priorityFilter) return;
    if (statusFilter === "Completed" && !task.completed) return;
    if (statusFilter === "Pending" && task.completed) return;

    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const today = new Date().toISOString().split("T")[0];
    if (task.deadline < today && !task.completed) li.classList.add("overdue");
    else if (task.deadline === today && !task.completed) li.classList.add("today");

    li.innerHTML = `
      <div class="task-info">
        <strong>${task.title}</strong> <br>
        ${task.category} | Deadline: ${task.deadline} | 
        <span>${task.priority}</span>
      </div>
      <div class="task-actions">
        <button class="done">${task.completed ? "Undo" : "Done"}</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

    // Mark complete
    li.querySelector(".done").addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Edit task
    li.querySelector(".edit").addEventListener("click", () => {
      document.getElementById("editIndex").value = index;
      document.getElementById("taskTitle").value = task.title;
      document.getElementById("taskDeadline").value = task.deadline;
      document.getElementById("taskCategory").value = task.category;
      document.getElementById("taskPriority").value = task.priority;
    });

    // Delete task
    li.querySelector(".delete").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    taskContainer.appendChild(li);
  });

  renderProgress();
  renderWeekly();
}

// Handle form submit
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editIndex = document.getElementById("editIndex").value;

  const newTask = {
    title: document.getElementById("taskTitle").value,
    deadline: document.getElementById("taskDeadline").value,
    category: document.getElementById("taskCategory").value,
    priority: document.getElementById("taskPriority").value,
    completed: false
  };

  if (editIndex) {
    tasks[editIndex] = newTask;
    document.getElementById("editIndex").value = "";
  } else {
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Filters & Search
searchBox.addEventListener("input", renderTasks);
filterPriority.addEventListener("change", renderTasks);
filterStatus.addEventListener("change", renderTasks);

// Clear all tasks
clearAllBtn.addEventListener("click", () => {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// Export tasks
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.json";
  a.click();
});

// Import tasks
importBtn.addEventListener("click", () => importTasks.click());
importTasks.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    tasks = JSON.parse(event.target.result);
    saveTasks();
    renderTasks();
  };
  reader.readAsText(file);
});

// Dark/Light Mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Initial render
renderTasks();
