const API_URL = "https://taskflow-api-rc2s.onrender.com";

// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    loadProjects();
});


// ==================================================
// HELPER: BACKEND ERROR MESSAGE
// ==================================================

async function getErrorMessage(response) {
    try {
        const data = await response.json();

        if (data.detail) {
            return data.detail;
        }

        return "Something went wrong";
    } catch {
        return "Something went wrong";
    }
}


// ==================================================
// CREATE TASK
// ==================================================

async function createTask() {

    const title = document.getElementById("title").value.trim();
    const description =
        document.getElementById("description").value.trim();

    const priority =
        document.getElementById("priority").value;

    const status =
        document.getElementById("status").value;

    const due_date =
        document.getElementById("due_date").value;

    const owner_id =
        Number(document.getElementById("owner_id").value);

    const project_id =
        Number(document.getElementById("project_id").value);


    // Validation

    if (!title) {
        alert("Please enter task title.");
        return;
    }

    if (!owner_id || owner_id <= 0) {
        alert("Please enter a valid Owner ID.");
        return;
    }

    if (!project_id || project_id <= 0) {
        alert("Please enter a valid Project ID.");
        return;
    }


    const taskData = {
        title: title,
        description: description || null,
        priority: priority,
        status: status,
        due_date: due_date || null,
        owner_id: owner_id,
        project_id: project_id
    };


    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(taskData)
            }
        );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        // Clear form

        document.getElementById("title").value = "";
        document.getElementById("description").value = "";

        document.getElementById("priority").value =
            "medium";

        document.getElementById("status").value =
            "todo";

        document.getElementById("due_date").value = "";


        await loadTasks();

        alert("Task added successfully!");


    } catch (error) {

        console.error("Create Task Error:", error);

        alert(
            "Unable to connect to the backend server."
        );
    }
}


// ==================================================
// LOAD ALL TASKS
// ==================================================

async function loadTasks() {

    try {

        const response =
            await fetch(`${API_URL}/tasks`);


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            console.error(message);

            return;
        }


        const tasks =
            await response.json();


        displayTasks(tasks);

        updateDashboard(tasks);


    } catch (error) {

        console.error(
            "Load Tasks Error:",
            error
        );

        const taskList =
            document.getElementById("taskList");


        if (taskList) {

            taskList.innerHTML = `
                <div class="loading">
                    Unable to connect to the backend.
                </div>
            `;
        }
    }
}


// ==================================================
// UPDATE DASHBOARD
// ==================================================

function updateDashboard(tasks) {

    const totalTasks =
        tasks.length;


    const inProgress =
        tasks.filter(
            task => task.status === "in-progress"
        ).length;


    const completed =
        tasks.filter(
            task => task.status === "completed"
        ).length;


    const highPriority =
        tasks.filter(
            task => task.priority === "high"
        ).length;


    const totalElement =
        document.getElementById("totalTasks");

    const progressElement =
        document.getElementById("progressTasks");

    const completedElement =
        document.getElementById("completedTasks");

    const highElement =
        document.getElementById("highTasks");


    if (totalElement) {
        totalElement.textContent =
            totalTasks;
    }


    if (progressElement) {
        progressElement.textContent =
            inProgress;
    }


    if (completedElement) {
        completedElement.textContent =
            completed;
    }


    if (highElement) {
        highElement.textContent =
            highPriority;
    }
}


// ==================================================
// DISPLAY TASKS
// ==================================================

function displayTasks(tasks) {

    const taskList =
        document.getElementById("taskList");


    if (!taskList) {
        return;
    }


    taskList.innerHTML = "";


    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="loading">
                No tasks found.
            </div>
        `;

        return;
    }


    tasks.forEach(task => {

        const taskCard =
            document.createElement("div");


        taskCard.className =
            "task-card";


        let completeButton = "";


        if (task.status !== "completed") {

            completeButton = `
                <button
                    class="complete-btn"
                    onclick="completeTask(${task.id})"
                >
                    Complete
                </button>
            `;
        }


        taskCard.innerHTML = `

            <h3>
                ${escapeHTML(task.title)}
            </h3>

            <p>
                ${
                    task.description
                        ? escapeHTML(task.description)
                        : "No description"
                }
            </p>

            <span class="priority">
                ${escapeHTML(task.priority)}
            </span>

            <span class="status">
                ${escapeHTML(task.status)}
            </span>

            <p>
                Due:
                ${task.due_date || "No due date"}
            </p>

            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})"
                >
                    Edit
                </button>

                ${completeButton}

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;


        taskList.appendChild(taskCard);

    });
}


// ==================================================
// GET SINGLE TASK
// ==================================================

async function getTask(taskId) {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return null;
        }


        return await response.json();


    } catch (error) {

        console.error(
            "Get Task Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );

        return null;
    }
}


// ==================================================
// EDIT TASK
// ==================================================

async function editTask(taskId) {

    const task =
        await getTask(taskId);


    if (!task) {
        return;
    }


    const newTitle =
        prompt(
            "Task Title:",
            task.title
        );


    if (newTitle === null) {
        return;
    }


    if (!newTitle.trim()) {

        alert(
            "Task title cannot be empty."
        );

        return;
    }


    const newDescription =
        prompt(
            "Description:",
            task.description || ""
        );


    if (newDescription === null) {
        return;
    }


    const newPriority =
        prompt(
            "Priority (low / medium / high):",
            task.priority
        );


    if (newPriority === null) {
        return;
    }


    const priority =
        newPriority.trim().toLowerCase();


    if (
        !["low", "medium", "high"].includes(priority)
    ) {

        alert(
            "Priority must be low, medium or high."
        );

        return;
    }


    const newStatus =
        prompt(
            "Status (todo / in-progress / completed):",
            task.status
        );


    if (newStatus === null) {
        return;
    }


    const status =
        newStatus.trim().toLowerCase();


    if (
        !["todo", "in-progress", "completed"]
            .includes(status)
    ) {

        alert(
            "Status must be todo, in-progress or completed."
        );

        return;
    }


    const newDueDate =
        prompt(
            "Due Date (YYYY-MM-DD):",
            task.due_date || ""
        );


    if (newDueDate === null) {
        return;
    }


    const updateData = {

        title:
            newTitle.trim(),

        description:
            newDescription.trim() || null,

        priority:
            priority,

        status:
            status,

        due_date:
            newDueDate.trim() || null
    };


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updateData)
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        await loadTasks();

        alert(
            "Task updated successfully!"
        );


    } catch (error) {

        console.error(
            "Update Task Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// COMPLETE TASK
// ==================================================

async function completeTask(taskId) {

    const task =
        await getTask(taskId);


    if (!task) {
        return;
    }


    const confirmComplete =
        confirm(
            "Are you sure you want to mark this task as completed?"
        );


    if (!confirmComplete) {
        return;
    }


    const updateData = {

        title:
            task.title,

        description:
            task.description,

        priority:
            task.priority,

        status:
            "completed",

        due_date:
            task.due_date
    };


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updateData)
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        await loadTasks();

        alert(
            "Task completed successfully!"
        );


    } catch (error) {

        console.error(
            "Complete Task Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// DELETE TASK
// ==================================================

async function deleteTask(taskId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${taskId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        await loadTasks();

        alert(
            "Task deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete Task Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// CREATE PROJECT
// ==================================================

async function createProject() {

    const nameElement =
        document.getElementById("projectName");

    const descriptionElement =
        document.getElementById(
            "projectDescription"
        );

    const ownerElement =
        document.getElementById(
            "projectOwnerId"
        );


    const name =
        nameElement.value.trim();


    const description =
        descriptionElement.value.trim();


    const owner_id =
        Number(ownerElement.value);


    if (!name) {

        alert(
            "Please enter project name."
        );

        return;
    }


    if (!owner_id || owner_id <= 0) {

        alert(
            "Please enter a valid Owner ID."
        );

        return;
    }


    const projectData = {

        name:
            name,

        description:
            description || null,

        owner_id:
            owner_id
    };


    try {

        const response =
            await fetch(
                `${API_URL}/projects`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(projectData)
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        nameElement.value = "";

        descriptionElement.value = "";


        await loadProjects();


        alert(
            "Project created successfully!"
        );


    } catch (error) {

        console.error(
            "Create Project Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// LOAD ALL PROJECTS
// ==================================================

async function loadProjects() {

    const projectList =
        document.getElementById(
            "projectList"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/projects`
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            console.error(message);

            throw new Error(message);
        }


        const projects =
            await response.json();


        displayProjects(projects);


    } catch (error) {

        console.error(
            "Load Projects Error:",
            error
        );


        if (projectList) {

            projectList.innerHTML = `
                <div class="loading">
                    Unable to load projects.
                </div>
            `;
        }
    }
}


// ==================================================
// DISPLAY PROJECTS
// ==================================================

function displayProjects(projects) {

    const projectList =
        document.getElementById(
            "projectList"
        );


    if (!projectList) {
        return;
    }


    projectList.innerHTML = "";


    if (projects.length === 0) {

        projectList.innerHTML = `
            <div class="loading">
                No projects found.
            </div>
        `;

        return;
    }


    projects.forEach(project => {

        const projectCard =
            document.createElement("div");


        projectCard.className =
            "task-card";


        projectCard.innerHTML = `

            <h3>
                ${escapeHTML(project.name)}
            </h3>

            <p>
                ${
                    project.description
                        ? escapeHTML(project.description)
                        : "No description"
                }
            </p>

            <p>
                Owner ID:
                ${project.owner_id}
            </p>

            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editProject(${project.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProject(${project.id})"
                >
                    Delete
                </button>

            </div>
        `;


        projectList.appendChild(
            projectCard
        );

    });
}


// ==================================================
// GET SINGLE PROJECT
// ==================================================

async function getProject(projectId) {

    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}`
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return null;
        }


        return await response.json();


    } catch (error) {

        console.error(
            "Get Project Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );

        return null;
    }
}


// ==================================================
// EDIT PROJECT
// ==================================================

async function editProject(projectId) {

    const project =
        await getProject(projectId);


    if (!project) {
        return;
    }


    const newName =
        prompt(
            "Project Name:",
            project.name
        );


    if (newName === null) {
        return;
    }


    if (!newName.trim()) {

        alert(
            "Project name cannot be empty."
        );

        return;
    }


    const newDescription =
        prompt(
            "Project Description:",
            project.description || ""
        );


    if (newDescription === null) {
        return;
    }


    /*
       NOTE:
       Project update endpoint backend me abhi nahi hai.
       Isliye ye function backend ke PUT endpoint ke
       available hone par hi work karega.
    */

    const updateData = {

        name:
            newName.trim(),

        description:
            newDescription.trim() || null
    };


    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updateData)
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        await loadProjects();


        alert(
            "Project updated successfully!"
        );


    } catch (error) {

        console.error(
            "Update Project Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// DELETE PROJECT
// ==================================================

async function deleteProject(projectId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this project?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/projects/${projectId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            alert(message);

            return;
        }


        await loadProjects();

        alert(
            "Project deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete Project Error:",
            error
        );

        alert(
            "Unable to connect to the backend."
        );
    }
}


// ==================================================
// REFRESH TASKS
// ==================================================

function refreshTasks() {
    loadTasks();
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}