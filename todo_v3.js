class Task {
  constructor(description, completed = false, timestamp = Date.now(), id = null) {
    this.id = id || Task.generateId();
    this.description = description;
    this.completed = completed;
    this.timestamp = timestamp;
  }
  static generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
    this.load();
  }
  addTask(description) {
    const task = new Task(description);
    this.tasks.push(task);
    this.save();
    return task;
  }
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
    }
  }
  editTask(id, newDesc) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.description = newDesc;
      this.save();
    }
  }
  save() {
    localStorage.setItem('todo-v3-tasks', JSON.stringify(this.tasks));
  }
  load() {
    const data = localStorage.getItem('todo-v3-tasks');
    if (data) {
      this.tasks = JSON.parse(data).map(t => new Task(t.description, t.completed, t.timestamp, t.id));
    }
  }
  filter(status) {
    if (status === 'all') return this.tasks;
    if (status === 'completed') return this.tasks.filter(t => t.completed);
    if (status === 'incomplete') return this.tasks.filter(t => !t.completed);
    return this.tasks;
  }
  sort(by) {
    if (by === 'alpha') {
      return [...this.tasks].sort((a, b) => a.description.localeCompare(b.description));
    }
    if (by === 'time') {
      return [...this.tasks].sort((a, b) => a.timestamp - b.timestamp);
    }
    return this.tasks;
  }
}

const manager = new TaskManager();
let currentFilter = 'all';
let currentSort = null;

const taskInput = document.getElementById('newTask');
const addTaskBtn = document.getElementById('addBtn');
const taskList = document.getElementById('todoList');
const allBtn = document.getElementById('allBtn');
const completedBtn = document.getElementById('completedBtn');
const incompleteBtn = document.getElementById('incompleteBtn');
const sortAlphaBtn = document.getElementById('sortAlphaBtn');
const sortTimeBtn = document.getElementById('sortTimeBtn');

function render() {
  let tasks = manager.filter(currentFilter);
  if (currentSort) tasks = manager.sort(currentSort).filter(t => tasks.includes(t));
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.completed ? ' completed' : '');
    // Emoji for completed/incomplete
    const emoji = document.createElement('span');
    emoji.style.fontSize = '1.3rem';
    emoji.style.marginRight = '8px';
    emoji.textContent = task.completed ? '✅' : '❌';
    li.appendChild(emoji);
    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = task.description;
    desc.onclick = () => {
      manager.toggleTask(task.id);
      render();
    };
    li.appendChild(desc);
    const actions = document.createElement('span');
    actions.className = 'actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.onclick = () => {
      const newDesc = prompt('Edit task:', task.description);
      if (newDesc) {
        manager.editTask(task.id, newDesc);
        render();
      }
    };
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => {
      manager.deleteTask(task.id);
      render();
    };
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

addTaskBtn.onclick = () => {
  const desc = taskInput.value.trim();
  if (desc) {
    manager.addTask(desc);
    taskInput.value = '';
    render();
  }
};

allBtn.onclick = () => { currentFilter = 'all'; setActiveFilter(allBtn); render(); };
completedBtn.onclick = () => { currentFilter = 'completed'; setActiveFilter(completedBtn); render(); };
incompleteBtn.onclick = () => { currentFilter = 'incomplete'; setActiveFilter(incompleteBtn); render(); };
sortAlphaBtn.onclick = () => { currentSort = 'alpha'; render(); };
sortTimeBtn.onclick = () => { currentSort = 'time'; render(); };

function setActiveFilter(btn) {
  [allBtn, completedBtn, incompleteBtn].forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', render);
