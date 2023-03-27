const addBtns = document.querySelectorAll(".add-btn");
const rows = document.querySelectorAll(".row");
let isDragging = false;

function createTask(task) {
  const newTask = document.createElement("div");
  newTask.classList.add("task");

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.name;
  input.placeholder = "New Task";
  input.disabled = true;

  input.addEventListener("input", (e) => {
    task.name = input.value;
    saveData();
    if (input.value != "") {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.disabled = true;
          saveData();
        }
      });
      input.addEventListener("blur", () => {
        input.disabled = true;
        saveData();
      });
    } else {
      input.disabled = false;
    }
  });

  newTask.append(input);

  const iconsDiv = document.createElement("div");
  iconsDiv.className = "icons-div";

  const editIcon = document.createElement("span");
  editIcon.innerHTML = `
    <ion-icon class='edit' name="create-outline"></ion-icon>
  `;

  const deleteIcon = document.createElement("span");
  deleteIcon.innerHTML = `
    <ion-icon class='delete' name="trash-outline"></ion-icon>
  `;

  newTask.append(iconsDiv);
  iconsDiv.append(editIcon);
  iconsDiv.append(deleteIcon);

  const editBtn = newTask.querySelector(".edit");
  editBtn.addEventListener("click", () => {
    input.disabled = !input.disabled;
    editBtn.classList.toggle("edit-mode");
    if (!input.disabled) {
      input.focus();
    }
  });

  newTask.setAttribute("draggable", "true");

  newTask.addEventListener("dragstart", (e) => {
    isDragging = true;
    newTask.classList.add("hovered");
    newTask.style.opacity = 0.5;
  });

  newTask.addEventListener("touchstart", (e) => {
    isDragging = true;
    newTask.classList.add("hovered");
    newTask.style.opacity = 0.5;
    // e.preventDefault(); // Prevent default touch action
  });

  newTask.addEventListener("dragend", () => {
    isDragging = false;
    newTask.classList.remove("hovered");
    newTask.style.opacity = 1;
  });

  newTask.addEventListener("touchend", () => {
    isDragging = false;
    newTask.classList.remove("hovered");
    newTask.style.opacity = 1;
  });

  return newTask;
}

function deleteTask(tasksCon) {
  tasksCon.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete")) {
      const task = e.target.closest(".task");
      task.remove();
      saveData();
    }
  });
}

function saveData() {
  const data = [];
  rows.forEach((row) => {
    const tasksArr = [];
    const tasksCon = row.querySelector(".tasksCon");
    tasksCon.querySelectorAll(".task").forEach((task) => {
      tasksArr.push({ name: task.querySelector("input").value });
    });
    data.push(tasksArr);
  });
  localStorage.setItem("tasks", JSON.stringify(data));
}

const savedData = JSON.parse(localStorage.getItem("tasks"));
if (savedData) {
  rows.forEach((row, i) => {
    const tasks = row.querySelector(".tasksCon");
    savedData[i].forEach((task) => {
      const div = createTask(task);
      tasks.appendChild(div);
    });
    deleteTask(tasks);
  });
}

rows.forEach((row) => {
  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (isDragging) {
      const sort = sorting(row, e.clientY);
      const draggable = document.querySelector(".hovered");
      if (sort == null) {
        row.querySelector(".tasksCon").appendChild(draggable);
      } else {
        row.querySelector(".tasksCon").insertBefore(draggable, sort);
      }
      saveData();
    }
  });
  row.addEventListener("touchmove", (e) => {
    if (isDragging) {
      e.preventDefault(); // Prevent default touch action
      const sort = sorting(row, e.touches[0].clientY); // Use touch coordinates
      const draggable = document.querySelector(".hovered");
      if (sort == null) {
        row.querySelector(".tasksCon").appendChild(draggable);
      } else {
        row.querySelector(".tasksCon").insertBefore(draggable, sort);
      }
      saveData();
    }
  });
});

//sorting tasks
function sorting(row, y) {
  const draggableElements = [...row.querySelectorAll(".task:not(.hovered)")];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

addBtns.forEach((btn) => {
  const tasksCon = btn.closest(".row").querySelector(".tasksCon");
  btn.addEventListener("click", () => {
    const task = createTask({ name: "" });
    task.querySelector("input").disabled = false;
    deleteTask(task);
    tasksCon.appendChild(task);
    saveData();
  });
});
