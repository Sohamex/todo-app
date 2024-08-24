document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const todoForm = document.getElementById('todoForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelector = document.getElementById('prioritySelector');

    // Retrieve tasks from localStorage or initialize as an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let selectedPriority = 'low'; // Default priority

    // Save tasks to localStorage and re-render the task lists
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Get the CSS class based on task priority
    function getPriorityClass(priority) {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-purple-500';
            case 'low': return 'bg-blue-500';
            default: return '';
        }
    }

    // Render the task lists
    function renderTasks() {
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        let hasTasks = false;
        let hasCompletedTasks = false;

        tasks.forEach((task, index) => {
            const taskPriorityClass = getPriorityClass(task.priority);

            const taskItem = document.createElement('li');
            taskItem.classList.add('p-2', 'rounded', 'flex', 'justify-between', 'items-center', 'bg-gray-600');

            // Apply priority class only if the task is not completed
            if (taskPriorityClass && !task.completed) {
                taskItem.classList.add(taskPriorityClass);
            }

            taskItem.dataset.index = index;
            taskItem.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} class="toggleCompleted cursor-pointer">
                </div>
                <div class="flex-grow overflow-hidden text-white">
                    <p>${task.text}</p>
                </div>
                <button data-index="${index}" class="deleteBtn bg-gray-600 flex-shrink-0 ml-4 border-2 border-white rounded p-1">
                    <img class="w-6 h-6" src="./assets/delete.png" alt="Delete">
                </button>
            `;

            if (task.completed) {
                completedTaskList.appendChild(taskItem);
                hasCompletedTasks = true;
            } else {
                taskList.appendChild(taskItem);
                hasTasks = true;
            }
        });

        // Display message if there are no tasks or completed tasks
        if (!hasTasks) {
            taskList.innerHTML = '<p class="text-gray-400 text-center border border-gray-500 rounded p-4">No tasks</p>';
        }

        if (!hasCompletedTasks) {
            completedTaskList.innerHTML = '<p class="text-gray-400 text-center border border-gray-500 rounded p-4">No completed tasks</p>';
        }

        // Attach event listeners for delete and toggle completion
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });

        document.querySelectorAll('.toggleCompleted').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });
    }

    // Delete task by index
    function deleteTask(event) {
        const index = event.target.dataset.index;
        tasks.splice(index, 1);
        saveTasks();
    }

    // Add a new task
    function addTask(event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, priority: selectedPriority, completed: false });
            saveTasks();
            taskInput.value = ''; // Clear the input
        }
    }

    // Toggle task completion status
    function toggleTaskCompletion(event) {
        const index = event.target.closest('li').dataset.index;
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
    }

    // Update UI to reflect selected priority
    function updatePriorityUI() {
        prioritySelector.querySelectorAll('div').forEach(div => {
            div.classList.remove('border-2', 'border-white');
        });
        const selectedCircle = prioritySelector.querySelector(`[data-priority="${selectedPriority}"]`);
        if (selectedCircle) {
            selectedCircle.classList.add('border-2', 'border-white');
        }
    }

    // Set priority when clicking on a circle
    prioritySelector.addEventListener('click', (event) => {
        if (event.target.dataset.priority) {
            selectedPriority = event.target.dataset.priority;
            updatePriorityUI();
        }
    });

    // Initialize the app
    todoForm.addEventListener('submit', addTask);
    renderTasks(); // Render the task list on page load
    updatePriorityUI(); // Initialize the priority selector UI
});
