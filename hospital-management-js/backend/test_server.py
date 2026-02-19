from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Robust General Hospital Management System API", version="1.0.0")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class UserBase(BaseModel):
    email: str
    password: str

class UserCreate(UserBase):
    firstName: str
    lastName: str
    role: str = "staff"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PatientBase(BaseModel):
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class DoctorBase(BaseModel):
    firstName: str
    lastName: str
    specialization: str
    phone: str
    email: str
    licenseNumber: str
    departmentId: str

class DoctorCreate(DoctorBase):
    pass

class AppointmentBase(BaseModel):
    patientId: str
    doctorId: str
    appointmentDate: str
    appointmentTime: str
    type: str
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

# Mock database
users = []
patients = [
    {"id": "1", "firstName": "John", "lastName": "Doe", "status": "active"},
    {"id": "2", "firstName": "Jane", "lastName": "Smith", "status": "active"}
]

doctors = [
    {"id": "1", "firstName": "Alice", "lastName": "Johnson", "specialization": "Cardiology", "phone": "555-0101", "email": "alice@hospital.com", "licenseNumber": "MD123", "departmentId": "1", "status": "active"},
    {"id": "2", "firstName": "Bob", "lastName": "Wilson", "specialization": "Neurology", "phone": "555-0102", "email": "bob@hospital.com", "licenseNumber": "MD456", "departmentId": "2", "status": "active"}
]

appointments = [
    {"id": "1", "patientId": "1", "doctorId": "1", "appointmentDate": "2025-12-09", "appointmentTime": "10:00", "type": "Checkup", "status": "scheduled"},
    {"id": "2", "patientId": "2", "doctorId": "2", "appointmentDate": "2025-12-09", "appointmentTime": "14:00", "type": "Consultation", "status": "scheduled"}
]

departments = [
    {"id": "1", "name": "Cardiology", "description": "Heart care", "status": "active"},
    {"id": "2", "name": "Neurology", "description": "Brain and nervous system", "status": "active"}
]

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = security):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = next((u for u in users if u["id"] == user_id), None)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Authentication routes
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    if any(u["email"] == user_data.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(len(users) + 1)
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "firstName": user_data.firstName,
        "lastName": user_data.lastName,
        "role": user_data.role,
        "password": hashed_password
    }
    
    users.append(new_user)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        role=user_data.role
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    # Find user
    user = next((u for u in users if u["email"] == user_credentials.email), None)
    if user is None or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    access_token = create_access_token(data={"sub": user["id"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        firstName=user["firstName"],
        lastName=user["lastName"],
        role=user["role"]
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = get_current_user):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        firstName=current_user["firstName"],
        lastName=current_user["lastName"],
        role=current_user["role"]
    )

# Routes
@app.get("/")
async def root():
    return {"message": "Hospital Management API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-12-09T16:00:00"}

# Patient endpoints
@app.get("/api/patients")
async def get_patients():
    return patients

@app.post("/api/patients")
async def create_patient(patient: PatientCreate):
    new_id = str(len(patients) + 1)
    new_patient = {
        "id": new_id,
        **patient.dict(),
        "status": "active"
    }
    patients.append(new_patient)
    return new_patient

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    for i, patient in enumerate(patients):
        if patient["id"] == patient_id:
            patients.pop(i)
            return {"message": "Patient deleted successfully"}
    raise HTTPException(status_code=404, detail="Patient not found")

# Doctor endpoints
@app.get("/api/doctors")
async def get_doctors():
    return doctors

@app.post("/api/doctors")
async def create_doctor(doctor: DoctorCreate):
    new_id = str(len(doctors) + 1)
    new_doctor = {
        "id": new_id,
        **doctor.dict(),
        "status": "active"
    }
    doctors.append(new_doctor)
    return new_doctor

@app.delete("/api/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    for i, doctor in enumerate(doctors):
        if doctor["id"] == doctor_id:
            doctors.pop(i)
            return {"message": "Doctor deleted successfully"}
    raise HTTPException(status_code=404, detail="Doctor not found")

# Appointment endpoints
@app.get("/api/appointments")
async def get_appointments():
    return appointments

@app.post("/api/appointments")
async def create_appointment(appointment: AppointmentCreate):
    new_id = str(len(appointments) + 1)
    new_appointment = {
        "id": new_id,
        **appointment.dict(),
        "status": "scheduled"
    }
    appointments.append(new_appointment)
    return new_appointment

@app.delete("/api/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    for i, appointment in enumerate(appointments):
        if appointment["id"] == appointment_id:
            appointments.pop(i)
            return {"message": "Appointment deleted successfully"}
    raise HTTPException(status_code=404, detail="Appointment not found")

# Department endpoints
@app.get("/api/departments")
async def get_departments():
    return departments

@app.post("/api/departments")
async def create_department(department: dict):
    new_id = str(len(departments) + 1)
    new_department = {
        "id": new_id,
        **department,
        "status": "active"
    }
    departments.append(new_department)
    return new_department

@app.delete("/api/departments/{department_id}")
async def delete_department(department_id: str):
    for i, department in enumerate(departments):
        if department["id"] == department_id:
            departments.pop(i)
            return {"message": "Department deleted successfully"}
    raise HTTPException(status_code=404, detail="Department not found")

# Medical Records endpoints
@app.get("/api/medical-records")
async def get_medical_records():
    # Sample medical records with proper doctor assignments
    medical_records = [
        {
            "id": "1",
            "patientId": "1",
            "assignedDoctorId": "1",  # Doctor 1 assigned to Patient 1
            "doctorId": "1",
            "patient": {
                "firstName": "John",
                "lastName": "Doe"
            },
            "doctor": {
                "firstName": "Dr. Sarah",
                "lastName": "Smith",
                "specialization": "Cardiology"
            },
            "diagnosis": "Hypertension - Stage 1",
            "createdAt": "2025-12-01T10:00:00"
        },
        {
            "id": "2", 
            "patientId": "2",
            "assignedDoctorId": "2",  # Doctor 2 assigned to Patient 2
            "doctorId": "2",
            "patient": {
                "firstName": "Jane",
                "lastName": "Smith"
            },
            "doctor": {
                "firstName": "Dr. Michael",
                "lastName": "Johnson",
                "specialization": "Neurology"
            },
            "diagnosis": "Migraine with aura",
            "createdAt": "2025-12-02T14:30:00"
        },
        {
            "id": "3",
            "patientId": "3", 
            "assignedDoctorId": "1",  # Doctor 1 also assigned to Patient 3
            "doctorId": "1",
            "patient": {
                "firstName": "Robert",
                "lastName": "Brown"
            },
            "doctor": {
                "firstName": "Dr. Sarah",
                "lastName": "Smith", 
                "specialization": "Cardiology"
            },
            "diagnosis": "Type 2 Diabetes",
            "createdAt": "2025-12-03T09:15:00"
        }
    ]
    return medical_records

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return {
        "stats": {
            "total_patients": len(patients),
            "today_appointments": len(appointments),
            "occupied_beds": "5/20",
            "active_doctors": len(doctors)
        },
        "recent_activities": [
            {
                "id": "1",
                "description": "New patient registered",
                "timestamp": "2025-12-09T16:00:00"
            },
            {
                "id": "2", 
                "description": "Appointment scheduled",
                "timestamp": "2025-12-09T15:30:00"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
