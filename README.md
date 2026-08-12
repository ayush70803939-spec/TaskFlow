# TaskFlow

A full-stack Task Management Application built with FastAPI, SQLAlchemy, HTML, CSS, and JavaScript.

## 📌 About the Project

TaskFlow is a simple and professional task management application that helps users create, manage, update, complete, and delete tasks.

It also provides project management functionality where users can create, edit, and delete projects and organize tasks under specific projects.

## ✨ Features

### Task Management
- Create new tasks
- View all tasks
- Edit tasks
- Mark tasks as completed
- Delete tasks
- Set task priority
- Set task status
- Add due dates
- Assign tasks to users and projects

### Project Management
- Create projects
- View all projects
- Edit projects
- Delete projects
- Assign projects to users
- Prevent deletion of projects that contain tasks

### Dashboard
- Total tasks
- In-progress tasks
- Completed tasks
- High-priority tasks

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database
- SQLite

### Version Control
- Git
- GitHub

## 📁 Project Structure

```text
TaskFlow/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── README.md
└── taskflow.db