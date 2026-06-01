let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
let focus = localStorage.getItem("taskflowFocus") || "";
let motivation = localStorage.getItem("taskflowMotivation") || "";
let theme = localStorage.getItem("taskflowTheme") || "dark";
let streak = Number(localStorage.getItem("taskflowStreak")) || 0;
let bestDay = JSON.parse(localStorage.getItem("taskflowBestDay")) || null;

const coverScreen = document.getElementById("coverScreen");
const plannerApp = document.getElementById("plannerApp");

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const categoryInput = document.getElementById("categoryInput");
const categoryFilter = document.getElementById("categoryFilter");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const streakCount = document.getElementById("streakCount");
const score = document.getElementById("score");

const focusInput = document.getElementById("focusInput");
const motivationInput = document.getElementById("motivationInput");
const summaryFocus = document.getElementById("summaryFocus");
const summaryMotivation = document.getElementById("summaryMotivation");
const bestDayText = document.getElementById("bestDay");

const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");
const flipSound = new Audio("flip.mp3");
flipSound.play();

function openPlanner() {
  const bookWrapper = document.querySelector(".book-wrapper");

  bookWrapper.classList.add("open");

  setTimeout(() => {
    coverScreen.classList.add("hidden");
    plannerApp.classList.remove("hidden");
    plannerApp.classList.add("planner-enter");
    window.scrollTo(0, 0);
  }, 1200);
}

function closePlanner() {
  plannerApp.classList.add("hidden");
  plannerApp.classList.remove("planner-enter");

  coverScreen.classList.remove("hidden");

  const bookWrapper = document.querySelector(".book-wrapper");

  bookWrapper.classList.add("open");

  setTimeout(() => {
    bookWrapper.classList.remove("open");
  }, 200);

  window.scrollTo(0, 0);
}

function setDateAndGreeting() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Good Evening 👋";

  if (hour < 12) {
    greeting = "Good Morning 👋";
  } else if (hour < 18) {
    greeting = "Good Afternoon 👋";
  }

  document.getElementById("greeting").textContent = greeting;

  document.getElementById("todayDate").textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  const task = {
    id: Date.now(),
    text,
    priority: priorityInput.value,
    category: categoryInput.value,
    completed: false
  };

  tasks.push(task);
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  const selectedCategory = categoryFilter.value;

  const filteredTasks = selectedCategory === "All"
    ? tasks
    : tasks.filter(task => task.category === selectedCategory);

  filteredTasks.forEach(task => {
    const li = document.createElement("li");

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="task-row">
        <div>
          <p class="task-title">${task.text}</p>
          <div class="badges">
            <span class="badge">${task.priority}</span>
            <span class="badge">${task.category}</span>
          </div>
        </div>

        <div class="actions">
          <button class="done-btn" onclick="toggleTask(${task.id})">
            ${task.completed ? "Undo" : "Done"}
          </button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">
            Delete
          </button>
        </div>
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
  score.textContent = percent + "%";
  progressText.textContent = percent + "%";

  const circleLength = 440;
  progressCircle.style.strokeDashoffset = circleLength - (circleLength * percent) / 100;
  updateMomentum(percent, completed);
  updateInsights(percent, completed);

  updateBestDay(percent);
  updateStreak(completed);
}

function updateInsights(percent, completed) {
  const insightStreak = document.getElementById("insightStreak");
  const insightCompleted = document.getElementById("insightCompleted");
  const insightRate = document.getElementById("insightRate");
  const insightBestDay = document.getElementById("insightBestDay");

  if (!insightStreak || !insightCompleted || !insightRate || !insightBestDay) {
    return;
  }

  insightStreak.textContent = `${streak} Days`;
  insightCompleted.textContent = `${completed} Tasks`;
  insightRate.textContent = `${percent}%`;

  if (bestDay) {
    insightBestDay.textContent = `${bestDay.percent}%`;
  } else {
    insightBestDay.textContent = "No best day yet";
  }
}

function updateMomentum(percent, completed) {
  const momentumText = document.getElementById("momentumText");
  const achievementText = document.getElementById("achievementText");

  if (completed === 0) {
    momentumText.textContent = "Start by completing one task today.";
    achievementText.textContent = "No achievement yet. Keep going.";
  } else if (percent < 50) {
    momentumText.textContent = "You have started. Keep the rhythm going.";
    achievementText.textContent = "First step completed.";
  } else if (percent < 100) {
    momentumText.textContent = "Strong progress. You are building momentum.";
    achievementText.textContent = "Halfway hero unlocked.";
  } else {
    momentumText.textContent = "Excellent work. You completed your day.";
    achievementText.textContent = "Perfect day completed.";
  }
}

function updateBestDay(percent) {
  const today = new Date().toLocaleDateString();

  if (!bestDay || percent > bestDay.percent) {
    bestDay = {
      date: today,
      percent
    };

    localStorage.setItem("taskflowBestDay", JSON.stringify(bestDay));
  }

  bestDayText.textContent = `${bestDay.percent}% completion on ${bestDay.date}`;
}

function updateStreak(completed) {
  const today = new Date().toLocaleDateString();
  const lastActiveDay = localStorage.getItem("taskflowLastActiveDay");

  if (completed > 0 && lastActiveDay !== today) {
    streak += 1;
    localStorage.setItem("taskflowStreak", streak);
    localStorage.setItem("taskflowLastActiveDay", today);
  }

  streakCount.textContent = `${streak} 🔥`;
}

function saveTasks() {
  localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

function toggleTheme() {
  document.body.classList.toggle("light");

  theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("taskflowTheme", theme);
}

focusInput.addEventListener("input", () => {
  focus = focusInput.value;
  localStorage.setItem("taskflowFocus", focus);
  summaryFocus.textContent = focus || "Not set yet";
  
  const todayFocusMirror = document.getElementById("todayFocusMirror");
if (todayFocusMirror) todayFocusMirror.value = focus;
});

motivationInput.addEventListener("input", () => {
  motivation = motivationInput.value;
  localStorage.setItem("taskflowMotivation", motivation);
  summaryMotivation.textContent = motivation || "Not written yet";
});

taskInput.addEventListener("keypress", event => {
  if (event.key === "Enter") {
    addTask();
  }
});

function initializeApp() {
  setDateAndGreeting();

  focusInput.value = focus;
  motivationInput.value = motivation;

  summaryFocus.textContent = focus || "Not set yet";
  summaryMotivation.textContent = motivation || "Not written yet";

  if (theme === "light") {
    document.body.classList.add("light");
  }

  streakCount.textContent = `${streak} 🔥`;

  renderTasks();
}

initializeApp();

let goals = JSON.parse(localStorage.getItem("taskflowGoals")) || [];
let notes = localStorage.getItem("taskflowNotes") || "";
let reflection = localStorage.getItem("taskflowReflection") || "";

function switchTab(tabId, button) {
  document.querySelectorAll(".tab-page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active-page");
  button.classList.add("active");

  window.scrollTo(0, 0);
}

function addGoal() {
  const goalInput = document.getElementById("goalInput");
  const goalCategory = document.getElementById("goalCategory");

  const text = goalInput.value.trim();

  if (!text) {
    alert("Please enter a goal.");
    return;
  }

  const goal = {
    id: Date.now(),
    text,
    category: goalCategory.value,
    completed: false
  };

  goals.push(goal);
  goalInput.value = "";
  saveGoals();
  renderGoals();
}

function toggleGoal(id) {
  goals = goals.map(goal => {
    if (goal.id === id) {
      return { ...goal, completed: !goal.completed };
    }

    return goal;
  });

  saveGoals();
  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  saveGoals();
  renderGoals();
}

function renderGoals() {
  const goalList = document.getElementById("goalList");

  if (!goalList) return;

  goalList.innerHTML = "";

  goals.forEach(goal => {
    const div = document.createElement("div");
    div.className = "goal-item";

    div.innerHTML = `
      <h3>${goal.completed ? "✅" : "🎯"} ${goal.text}</h3>
      <p>${goal.category} Goal</p>
      <div class="actions">
        <button class="done-btn" onclick="toggleGoal(${goal.id})">
          ${goal.completed ? "Undo" : "Complete"}
        </button>
        <button class="delete-btn" onclick="deleteGoal(${goal.id})">
          Delete
        </button>
      </div>
    `;

    goalList.appendChild(div);
  });
}

function saveGoals() {
  localStorage.setItem("taskflowGoals", JSON.stringify(goals));
}

document.addEventListener("DOMContentLoaded", () => {
  const notesInput = document.getElementById("notesInput");
  const reflectionInput = document.getElementById("reflectionInput");
  const todayFocusMirror = document.getElementById("todayFocusMirror");

  if (notesInput) {
    notesInput.value = notes;
    notesInput.addEventListener("input", () => {
      localStorage.setItem("taskflowNotes", notesInput.value);
    });
  }

  if (reflectionInput) {
    reflectionInput.value = reflection;
    reflectionInput.addEventListener("input", () => {
      localStorage.setItem("taskflowReflection", reflectionInput.value);
    });
  }

  if (todayFocusMirror) {
    todayFocusMirror.value = focus;
    todayFocusMirror.addEventListener("input", () => {
      focus = todayFocusMirror.value;
      focusInput.value = focus;
      localStorage.setItem("taskflowFocus", focus);
      summaryFocus.textContent = focus || "Not set yet";
    });
  }

  renderGoals();
});