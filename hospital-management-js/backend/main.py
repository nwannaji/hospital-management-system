from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPBasic
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime, timedelta
import os
import uuid
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from prisma import Client
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
prisma = Client()

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
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Email Settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@hospital.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(bearer_security), db: Prisma = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise credentials_exception
    return user

# Email utilities
async def send_password_reset_email(email: str, token: str):
    """Send password reset email to user"""
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    message = EmailMessage()
    message["From"] = FROM_EMAIL
    message["To"] = email
    message["Subject"] = "Password Reset Request - Hospital Management System"
    
    html_content = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>Hi,</p>
        <p>We received a request to reset your password for the Hospital Management System.</p>
        <p>Click the link below to reset your password:</p>
        <a href="{reset_link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>{reset_link}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br/>Hospital Management Team</p>
    </body>
    </html>
    """
    
    message.set_content(f"""
Password Reset Request

Hi,

We received a request to reset your password for the Hospital Management System.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
Hospital Management Team
    """)
    
    message.add_alternative(html_content, subtype="html")
    
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def generate_reset_token():
    """Generate a secure reset token"""
    return str(uuid.uuid4())

# Login endpoint
class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": login_data.email})
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# Forgot Password endpoints
@app.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Prisma = Depends(get_db)):
    """Handle forgot password request"""
    user = await db.user.find_unique(where={"email": request.email})
    
    # Always return success to prevent email enumeration attacks
    if not user:
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
    # Delete any existing reset tokens for this user
    await db.passwordresettoken.delete_many(where={"userId": user.id})
    
    # Generate new reset token
    token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    
    # Save reset token to database
    await db.passwordresettoken.create({
        "data": {
            "token": token,
            "userId": user.id,
            "expiresAt": expires_at
        }
    })
    
    # Send reset email
    email_sent = await send_password_reset_email(user.email, token)
    
    if email_sent:
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    else:
        # If email fails, still return success but log the error
        print(f"Failed to send password reset email to {user.email}")
        return {"message": "If an account with that email exists, a password reset link has been sent."}

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Prisma = Depends(get_db)):
    """Handle password reset with token"""
    # Find the reset token
    reset_token = await db.passwordresettoken.find_unique(where={"token": request.token})
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if reset_token.expiresAt < datetime.utcnow():
        # Delete expired token
        await db.passwordresettoken.delete(where={"id": reset_token.id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Get the user
    user = await db.user.find_unique(where={"id": reset_token.userId})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Hash the new password
    hashed_password = get_password_hash(request.new_password)
    
    # Update user password
    await db.user.update({
        "where": {"id": user.id},
        "data": {"password": hashed_password}
    })
    
    # Delete the reset token
    await db.passwordresettoken.delete(where={"id": reset_token.id})
    
    return {"message": "Password has been reset successfully"}

# Pydantic Models
class UserBase(BaseModel):
    email: str
    username: str
    role: str = "STAFF"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="STAFF", regex=r'^(STAFF|DOCTOR|PATIENT)$')

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str

class PatientBase(BaseModel):
    firstName: str
    lastName: str
    dateOfBirth: datetime
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[str] = None
    emergencyPhone: Optional[str] = None

class PatientCreate(PatientBase):
    firstName: str = Field(..., min_length=2, max_length=50)
    lastName: str = Field(..., min_length=2, max_length=50)
    dateOfBirth: datetime = Field(..., description="Patient date of birth")
    gender: str = Field(..., regex=r'^(male|female|other)$')
    phone: str = Field(..., regex=r'^[\+]?[1-9]\d{3}[-.\s]?\d{4}[-.\s]?\d{4}$')
    email: Optional[str] = Field(None, regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    address: Optional[str] = None
    emergencyContact: Optional[str] = None
    emergencyPhone: Optional[str] = None
    pass

class PatientResponse(PatientBase):
    id: str
    status: str

class DoctorBase(BaseModel):
    firstName: str
    lastName: str
    specialization: str
    phone: str
    email: str
    licenseNumber: str
    departmentId: str

class DoctorCreate(DoctorBase):
    firstName: str = Field(..., min_length=2, max_length=50)
    lastName: str = Field(..., min_length=2, max_length=50)
    specialization: str = Field(..., min_length=3, max_length=100)
    phone: str = Field(..., regex=r'^[\+]?[1-9]\d{3}[-.\s]?\d{4}[-.\s]?\d{4}$')
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    licenseNumber: str = Field(..., min_length=5, max_length=20)
    departmentId: str = Field(..., min_length=1)
    userId: str

class DoctorResponse(DoctorBase):
    id: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    patientId: str
    doctorId: str
    appointmentDate: datetime
    appointmentTime: str
    duration: int = 30
    type: str
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

# Database dependency
async def get_db():
    return prisma

# Startup event
@app.on_event("startup")
async def startup():
    await prisma.connect()

# Shutdown event
@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# Routes
@app.get("/")
async def root():
    return {"message": "Hospital Management API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# User routes
@app.get("/api/users", response_model=List[UserResponse])
async def get_users(db: Prisma = Depends(get_db)):
    users = await db.user.find_many()
    return users

@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Prisma = Depends(get_db)):
    hashed_password = get_password_hash(user.password)
    new_user = await db.user.create({
        "data": {
            **user.dict(exclude={"password"}),
            "password": hashed_password
        }
    })
    return new_user

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserBase, db: Prisma = Depends(get_db)):
    updated_user = await db.user.update({
        "where": {"id": user_id},
        "data": user.dict()
    })
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str, db: Prisma = Depends(get_db)):
    user = await db.user.delete(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Patient routes
@app.get("/api/patients", response_model=List[PatientResponse])
async def get_patients(db: Prisma = Depends(get_db)):
    patients = await db.patient.find_many()
    return patients

@app.post("/api/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: Prisma = Depends(get_db)):
    new_patient = await db.patient.create({
        "data": {
            **patient.dict(),
            "dateOfBirth": patient.dateOfBirth,
        }
    })
    return new_patient

@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, db: Prisma = Depends(get_db)):
    patient = await db.patient.find_unique(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.put("/api/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: str, patient: PatientBase, db: Prisma = Depends(get_db)):
    updated_patient = await db.patient.update({
        "where": {"id": patient_id},
        "data": {
            **patient.dict(),
            "dateOfBirth": patient.dateOfBirth,
        }
    })
    if not updated_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return updated_patient

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str, db: Prisma = Depends(get_db)):
    patient = await db.patient.delete(where={"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}

# Doctor routes
@app.get("/api/doctors", response_model=List[DoctorResponse])
async def get_doctors(db: Prisma = Depends(get_db)):
    doctors = await db.doctor.find_many(include={"user": True, "department": True})
    return doctors

@app.post("/api/doctors", response_model=DoctorResponse)
async def create_doctor(doctor: DoctorCreate, db: Prisma = Depends(get_db)):
    new_doctor = await db.doctor.create({
        "data": {
            **doctor.dict(),
        }
    })
    return new_doctor

@app.get("/api/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: str, db: Prisma = Depends(get_db)):
    doctor = await db.doctor.find_unique(where={"id": doctor_id}, include={"user": True, "department": True})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@app.put("/api/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(doctor_id: str, doctor: DoctorBase, db: Prisma = Depends(get_db)):
    updated_doctor = await db.doctor.update({
        "where": {"id": doctor_id},
        "data": doctor.dict()
    })
    if not updated_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return updated_doctor

@app.delete("/api/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, db: Prisma = Depends(get_db)):
    doctor = await db.doctor.delete(where={"id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deleted successfully"}

# Appointment routes
@app.get("/api/appointments", response_model=List[AppointmentResponse])
async def get_appointments(db: Prisma = Depends(get_db)):
    appointments = await db.appointment.find_many(include={"patient": True, "doctor": True})
    return appointments

@app.post("/api/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, db: Prisma = Depends(get_db)):
    new_appointment = await db.appointment.create({
        "data": {
            **appointment.dict(),
            "appointmentDate": appointment.appointmentDate,
        }
    })
    return new_appointment

@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: str, db: Prisma = Depends(get_db)):
    appointment = await db.appointment.find_unique(
        where={"id": appointment_id}, 
        include={"patient": True, "doctor": True}
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@app.put("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(appointment_id: str, appointment: AppointmentBase, db: Prisma = Depends(get_db)):
    updated_appointment = await db.appointment.update({
        "where": {"id": appointment_id},
        "data": {
            **appointment.dict(),
            "appointmentDate": appointment.appointmentDate,
        }
    })
    if not updated_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated_appointment

@app.delete("/api/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, db: Prisma = Depends(get_db)):
    appointment = await db.appointment.delete(where={"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

class StaffBase(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    position: str
    departmentId: str

class StaffCreate(StaffBase):
    userId: str

class StaffResponse(StaffBase):
    id: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    roomNumber: str
    roomType: str
    capacity: int
    departmentId: str
    status: str = "available"

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: str
    currentPatientId: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class MedicalRecordBase(BaseModel):
    patientId: str
    doctorId: str
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    appointmentId: Optional[str] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: str
    appointmentId: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

# Department routes
@app.get("/api/departments", response_model=List[DepartmentResponse])
@limiter.limit("100/minute")
async def get_departments(db: Prisma = Depends(get_db)):
    departments = await db.department.find_many(include={"headDoctor": True})
    return departments

@app.post("/api/departments", response_model=DepartmentResponse)
@limiter.limit("10/minute")
async def create_department(department: DepartmentCreate, db: Prisma = Depends(get_db)):
    new_department = await db.department.create({
        "data": department.dict()
    })
    return new_department

@app.get("/api/departments/{department_id}", response_model=DepartmentResponse)
@limiter.limit("100/minute")
async def get_department(department_id: str, db: Prisma = Depends(get_db)):
    department = await db.department.find_unique(
        where={"id": department_id}, 
        include={"headDoctor": True, "doctors": True, "staff": True}
    )
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@app.put("/api/departments/{department_id}", response_model=DepartmentResponse)
@limiter.limit("5/minute")
async def update_department(department_id: str, department: DepartmentBase, db: Prisma = Depends(get_db)):
    updated_department = await db.department.update({
        "where": {"id": department_id},
        "data": department.dict()
    })
    if not updated_department:
        raise HTTPException(status_code=404, detail="Department not found")
    return updated_department

@app.delete("/api/departments/{department_id}")
@limiter.limit("5/minute")
async def delete_department(department_id: str, db: Prisma = Depends(get_db)):
    department = await db.department.delete(where={"id": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted successfully"}

# Staff routes
@app.get("/api/staff", response_model=List[StaffResponse])
async def get_staff(db: Prisma = Depends(get_db)):
    staff = await db.staff.find_many(include={"user": True, "department": True})
    return staff

@app.post("/api/staff", response_model=StaffResponse)
async def create_staff(staff: StaffCreate, db: Prisma = Depends(get_db)):
    new_staff = await db.staff.create({
        "data": staff.dict()
    })
    return new_staff

@app.get("/api/staff/{staff_id}", response_model=StaffResponse)
async def get_staff_member(staff_id: str, db: Prisma = Depends(get_db)):
    staff_member = await db.staff.find_unique(
        where={"id": staff_id}, 
        include={"user": True, "department": True}
    )
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff_member

@app.put("/api/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(staff_id: str, staff: StaffBase, db: Prisma = Depends(get_db)):
    updated_staff = await db.staff.update({
        "where": {"id": staff_id},
        "data": staff.dict()
    })
    if not updated_staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return updated_staff

@app.delete("/api/staff/{staff_id}")
async def delete_staff(staff_id: str, db: Prisma = Depends(get_db)):
    staff_member = await db.staff.delete(where={"id": staff_id})
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return {"message": "Staff member deleted successfully"}

# Room routes
@app.get("/api/rooms", response_model=List[RoomResponse])
async def get_rooms(db: Prisma = Depends(get_db)):
    rooms = await db.room.find_many(include={"department": True, "currentPatient": True})
    return rooms

@app.post("/api/rooms", response_model=RoomResponse)
async def create_room(room: RoomCreate, db: Prisma = Depends(get_db)):
    new_room = await db.room.create({
        "data": room.dict()
    })
    return new_room

@app.get("/api/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, db: Prisma = Depends(get_db)):
    room = await db.room.find_unique(
        where={"id": room_id}, 
        include={"department": True, "currentPatient": True}
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@app.put("/api/rooms/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, room: RoomBase, db: Prisma = Depends(get_db)):
    updated_room = await db.room.update({
        "where": {"id": room_id},
        "data": room.dict()
    })
    if not updated_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return updated_room

@app.delete("/api/rooms/{room_id}")
async def delete_room(room_id: str, db: Prisma = Depends(get_db)):
    room = await db.room.delete(where={"id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted successfully"}

# Medical Records routes
@app.get("/api/medical-records", response_model=List[MedicalRecordResponse])
async def get_medical_records(db: Prisma = Depends(get_db)):
    records = await db.medicalrecord.find_many(include={"patient": True, "doctor": True})
    return records

@app.post("/api/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(record: MedicalRecordCreate, db: Prisma = Depends(get_db)):
    new_record = await db.medicalrecord.create({
        "data": record.dict()
    })
    return new_record

@app.get("/api/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(record_id: str, db: Prisma = Depends(get_db)):
    record = await db.medicalrecord.find_unique(
        where={"id": record_id}, 
        include={"patient": True, "doctor": True, "appointment": True}
    )
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@app.put("/api/medical-records/{record_id}", response_model=MedicalRecordResponse)
async def update_medical_record(record_id: str, record: MedicalRecordBase, db: Prisma = Depends(get_db)):
    updated_record = await db.medicalrecord.update({
        "where": {"id": record_id},
        "data": record.dict()
    })
    if not updated_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return updated_record

@app.delete("/api/medical-records/{record_id}")
async def delete_medical_record(record_id: str, db: Prisma = Depends(get_db)):
    record = await db.medicalrecord.delete(where={"id": record_id})
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return {"message": "Medical record deleted successfully"}

# Dashboard stats
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Prisma = Depends(get_db)):
    total_patients = await db.patient.count()
    total_doctors = await db.doctor.count(where={"status": "active"})
    
    today = datetime.now().date()
    today_appointments = await db.appointment.count(
        where={
            "appointmentDate": {
                "gte": datetime.combine(today, datetime.min.time()),
                "lte": datetime.combine(today, datetime.max.time())
            }
        }
    )
    
    total_rooms = await db.room.count()
    occupied_rooms = await db.room.count(where={"status": "occupied"})
    
    return {
        "stats": {
            "total_patients": total_patients,
            "today_appointments": today_appointments,
            "occupied_beds": f"{occupied_rooms}/{total_rooms}",
            "active_doctors": total_doctors
        },
        "recent_activities": [
            {
                "id": "1",
                "description": "New patient registered",
                "timestamp": datetime.now().isoformat()
            },
            {
                "id": "2", 
                "description": "Appointment scheduled",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
