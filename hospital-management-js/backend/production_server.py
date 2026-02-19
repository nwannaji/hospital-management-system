from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPBasic
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import os
import uuid
import sqlite3
import json
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Robust General Hospital Management System API", version="1.0.0")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    logger.error(f"Request path: {request.url.path}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Client IP: {request.client.host}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_security = HTTPBearer()
basic_security = HTTPBasic()

# Database setup
def get_db_connection():
    conn = sqlite3.connect('hospital_mgt.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'STAFF',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            date_of_birth DATETIME,
            gender TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            emergency_contact TEXT,
            emergency_phone TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            license_number TEXT NOT NULL,
            department_id TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic Models
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    status: str
    createdAt: datetime

    model_config = {"from_attributes": True}

class UserBase(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="STAFF", pattern=r'^(STAFF|DOCTOR|PATIENT)$')

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: str
    createdAt: datetime

    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Database dependency
async def get_db():
    return get_db_connection()

# Routes
@app.get("/")
async def root():
    return {"message": "Hospital Management API - Production"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Department routes
@app.get("/api/departments", response_model=List[DepartmentResponse])
async def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM departments WHERE status = 'active'")
    departments = cursor.fetchall()
    conn.close()
    
    result = []
    for dept in departments:
        result.append({
            "id": dept["id"],
            "name": dept["name"],
            "description": dept["description"],
            "status": dept["status"],
            "createdAt": dept["created_at"]
        })
    return result

@app.post("/api/departments", response_model=DepartmentResponse)
async def create_department(department: DepartmentCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    dept_id = str(uuid.uuid4())
    
    cursor.execute('''
        INSERT INTO departments (id, name, description, status, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (dept_id, department.name, department.description, "active"))
    
    conn.commit()
    conn.close()
    
    return {
        "id": dept_id,
        "name": department.name,
        "description": department.description,
        "status": "active",
        "createdAt": datetime.now()
    }

@app.get("/api/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM departments WHERE id = ? AND status = 'active'", (department_id,))
    department = cursor.fetchone()
    conn.close()
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return {
        "id": department["id"],
        "name": department["name"],
        "description": department["description"],
        "status": department["status"],
        "createdAt": department["created_at"]
    }

@app.put("/api/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(department_id: str, department: DepartmentBase):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE departments 
        SET name = ?, description = ?
        WHERE id = ? AND status = 'active'
    ''', (department.name, department.description, department_id))
    
    conn.commit()
    conn.close()
    
    return {
        "id": department_id,
        "name": department.name,
        "description": department.description,
        "status": "active",
        "createdAt": datetime.now()
    }

@app.delete("/api/departments/{department_id}")
async def delete_department(department_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE departments SET status = 'inactive' WHERE id = ?", (department_id,))
    conn.commit()
    conn.close()
    return {"message": "Department deleted successfully"}

# Dashboard stats
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get counts
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status = 'active'")
    patients_count = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM departments WHERE status = 'active'")
    departments_count = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM doctors WHERE status = 'active'")
    doctors_count = cursor.fetchone()["count"]
    
    conn.close()
    
    return {
        "stats": {
            "total_patients": patients_count,
            "today_appointments": 0,  # Would need appointments table
            "occupied_beds": "5/20",
            "active_doctors": doctors_count
        },
        "recent_activities": [
            {
                "id": "1",
                "description": "System initialized",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("production_server:app", host="0.0.0.0", port=8000, reload=True)
