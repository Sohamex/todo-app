document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const todoForm = document.getElementById('todoForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelector = document.getElementById('prioritySelector');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let selectedPriority = 'low'; // Default priority

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-purple-500';
            case 'low': return 'bg-blue-500';
            default: return '';
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        let hasTasks = false;
        let hasCompletedTasks = false;

        tasks.forEach((task, index) => {
            const taskPriorityClass = getPriorityClass(task.priority);
            const pinnedClass = task.pinned ? 'border-l-4 border-blue-500' : '';

            const taskItem = document.createElement('li');
            taskItem.classList.add('p-2', 'rounded', 'flex', 'justify-between', 'items-center', 'bg-gray-600');

            if (taskPriorityClass && !task.completed) {
                taskItem.classList.add(taskPriorityClass);
            }
            if (pinnedClass) {
                taskItem.classList.add(pinnedClass);
            }

            taskItem.setAttribute('draggable', 'true');
            taskItem.dataset.index = index;
            taskItem.innerHTML = `
                <div class="checkbox-container flex-shrink-0">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="toggleCompleted">
                </div>
                <div class="flex-grow overflow-hidden text-white">
                    <p>${task.text}</p>
                </div>
                <button data-index="${index}" class="deleteBtn text-white bg-gray-600 flex-shrink-0 ml-4 border-2 border-white rounded py-1 px-2">Delete</button>
            `;

            taskItem.addEventListener('dragstart', handleDragStart);
            taskItem.addEventListener('dragover', handleDragOver);
            taskItem.addEventListener('drop', handleDrop);
            taskItem.addEventListener('dragend', handleDragEnd);

            if (task.completed) {
                completedTaskList.appendChild(taskItem);
                hasCompletedTasks = true;
            } else {
                taskList.appendChild(taskItem);
                hasTasks = true;
            }
        });

        if (!hasTasks) {
            taskList.innerHTML = '<p class="text-gray-400 text-center border border-gray-500 rounded p-4">No tasks</p>';
        }

        if (!hasCompletedTasks) {
            completedTaskList.innerHTML = '<p class="text-gray-400 text-center border border-gray-500 rounded p-4">No completed tasks</p>';
        }

        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });

        document.querySelectorAll('.toggleCompleted').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });
    }

    function deleteTask(event) {
        const index = event.target.dataset.index;
        tasks.splice(index, 1);
        saveTasks();
    }

    function addTask(event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, priority: selectedPriority, completed: false, pinned: false });
            saveTasks();
            taskInput.value = '';
        }
    }

    function toggleTaskCompletion(event) {
        const index = event.target.closest('li').dataset.index;
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
    }

    let draggedIndex = null;

    function handleDragStart(event) {
        draggedIndex = event.target.dataset.index;
        event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
        const target = event.target.closest('li');
        if (target && target !== event.target) {
            target.classList.add('drag-over');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const target = event.target.closest('li');
        const targetIndex = target.dataset.index;
        const draggedTask = tasks.splice(draggedIndex, 1)[0];
        tasks.splice(targetIndex, 0, draggedTask);
        saveTasks();
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
        taskList.querySelectorAll('li').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    prioritySelector.addEventListener('click', (event) => {
        if (event.target.dataset.priority) {
            selectedPriority = event.target.dataset.priority;
            updatePriorityUI();
        }
    });

    function updatePriorityUI() {
        prioritySelector.querySelectorAll('div').forEach(div => {
            div.classList.remove('border-2', 'border-white');
        });
        const selectedCircle = prioritySelector.querySelector(`[data-priority="${selectedPriority}"]`);
        if (selectedCircle) {
            selectedCircle.classList.add('border-2', 'border-white');
        }
    }

    todoForm.addEventListener('submit', addTask);
    renderTasks();
    updatePriorityUI(); // Initialize UI with the default priority
});
