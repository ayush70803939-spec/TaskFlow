from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from . import models, schemas


app = FastAPI(title="TaskFlow API")


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "TaskFlow API is running"
    }


# ==================================================
# USER API
# ==================================================

@app.post(
    "/users",
    response_model=schemas.UserResponse
)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.User(
        name=user.name,
        email=user.email
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ==================================================
# PROJECT API
# ==================================================


# --------------------------------------------------
# CREATE PROJECT
# --------------------------------------------------

@app.post(
    "/projects",
    response_model=schemas.ProjectResponse
)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db)
):

    user = (
        db.query(models.User)
        .filter(models.User.id == project.owner_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_project = models.Project(
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# --------------------------------------------------
# GET ALL PROJECTS
# --------------------------------------------------

@app.get(
    "/projects",
    response_model=list[schemas.ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db)
):

    projects = (
        db.query(models.Project)
        .all()
    )

    return projects


# --------------------------------------------------
# GET SINGLE PROJECT
# --------------------------------------------------

@app.get(
    "/projects/{project_id}",
    response_model=schemas.ProjectResponse
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# --------------------------------------------------
# UPDATE PROJECT
# --------------------------------------------------

@app.put(
    "/projects/{project_id}",
    response_model=schemas.ProjectResponse
)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db)
):

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if project_update.name is not None:
        project.name = project_update.name

    if project_update.description is not None:
        project.description = project_update.description

    db.commit()
    db.refresh(project)

    return project


# --------------------------------------------------
# DELETE PROJECT
# --------------------------------------------------

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Check whether project has tasks

    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.project_id == project_id
        )
        .all()
    )

    if tasks:
        raise HTTPException(
            status_code=400,
            detail=(
                "Project cannot be deleted "
                "because it has tasks"
            )
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully"
    }


# ==================================================
# TASK API
# ==================================================


# --------------------------------------------------
# CREATE TASK
# --------------------------------------------------

@app.post(
    "/tasks",
    response_model=schemas.TaskResponse
)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db)
):

    # Check owner

    user = (
        db.query(models.User)
        .filter(models.User.id == task.owner_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check project

    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == task.project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    new_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        owner_id=task.owner_id,
        project_id=task.project_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# --------------------------------------------------
# GET ALL TASKS
# --------------------------------------------------

@app.get(
    "/tasks",
    response_model=list[schemas.TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db)
):

    tasks = (
        db.query(models.Task)
        .all()
    )

    return tasks


# --------------------------------------------------
# GET SINGLE TASK
# --------------------------------------------------

@app.get(
    "/tasks/{task_id}",
    response_model=schemas.TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# --------------------------------------------------
# UPDATE TASK
# --------------------------------------------------

@app.put(
    "/tasks/{task_id}",
    response_model=schemas.TaskResponse
)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db)
):

    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Update title

    if task_update.title is not None:
        task.title = task_update.title

    # Update description

    if task_update.description is not None:
        task.description = task_update.description

    # Update priority

    if task_update.priority is not None:

        if task_update.priority not in [
            "low",
            "medium",
            "high"
        ]:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Priority must be "
                    "low, medium or high"
                )
            )

        task.priority = task_update.priority

    # Update status

    if task_update.status is not None:

        if task_update.status not in [
            "todo",
            "in-progress",
            "completed"
        ]:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Status must be "
                    "todo, in-progress or completed"
                )
            )

        task.status = task_update.status

    # Update due date

    if task_update.due_date is not None:
        task.due_date = task_update.due_date

    db.commit()
    db.refresh(task)

    return task


# --------------------------------------------------
# DELETE TASK
# --------------------------------------------------

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }