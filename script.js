let tasks = [];

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

const focusInput = document.getElementById("focusInput");
const motivationInput = document.getElementById("motivationInput");
const summaryFocus = document.getElementById("summaryFocus");
const summaryMotivation = document.getElementById("summaryMotivation");
const summaryProgress = document.getElementById("summaryProgress");

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Please enter a task.");
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    completed: false
  };

  tasks.push(task);
  taskInput.value = "";
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return {
        ...task,
        completed: !task.completed
      };
    }
    return task;
  });

  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="actions">
        <button class="complete-btn" onclick="toggleTask(${task.id})">
          ${task.completed ? "Undo" : "Done"}
        </button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">
          Delete
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  progressPercent.textContent = percent + "%";
  progressFill.style.width = percent + "%";
  summaryProgress.textContent = percent + "%";
}

focusInput.addEventListener("input", () => {
  summaryFocus.textContent = focusInput.value.trim() || "Not set yet";
});

motivationInput.addEventListener("input", () => {
  summaryMotivation.textContent = motivationInput.value.trim() || "Not written yet";
});

taskInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});