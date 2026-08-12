from datetime import date
from pydantic import BaseModel


# =========================
# USER SCHEMAS
# =========================

class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


# =========================
# PROJECT SCHEMAS
# =========================

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    owner_id: int


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


# =========================
# TASK SCHEMAS
# =========================

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str = "medium"
    status: str = "todo"
    due_date: date | None = None
    owner_id: int
    project_id: int


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    priority: str
    status: str
    due_date: date | None = None
    owner_id: int
    project_id: int

    class Config:
        from_attributes = True


# =========================
# TASK UPDATE SCHEMA
# =========================

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None