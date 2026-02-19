# Robust General Hospital Management System

A comprehensive hospital management system built with React and FastAPI, featuring role-based access control and modern UI/UX.

## Features

- **Role-Based Access Control**: Doctors, Patients, Administrators, and Receptionists with specific permissions
- **Medical Records Security**: Doctors can only access records of assigned patients; Admins are denied access to medical records
- **Modern UI**: Built with React, Tailwind CSS, and Heroicons
- **RESTful API**: FastAPI backend with JWT authentication
- **Responsive Design**: Mobile-friendly interface

## User Roles & Permissions

### Doctors

- Full access to hospital resources
- Can only access medical records of assigned patients
- Can manage appointments and patient information

### Patients

- Can access own medical records
- Can manage appointments
- Limited to personal information

### Administrators

- Full system access except medical records
- Can manage users, departments, and settings
- Cannot access patient medical records (security restriction)

### Receptionists

- Manage patient information
- Handle appointments
- Limited to administrative tasks

## Tech Stack

**Frontend:**

- React 19.2.0
- Vite 7.2.4
- Tailwind CSS
- React Router
- Heroicons

**Backend:**

- FastAPI
- Python
- JWT Authentication
- CORS Support

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+

### Installation

1. Clone the repository
2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   python test_server.py
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Default Test Users

Register new users with these roles:

- **Doctor**: email `doctor@hospital.com`, password `password123`
- **Patient**: email `patient@hospital.com`, password `password123`
- **Admin**: email `admin@hospital.com`, password `password123`
- **Receptionist**: email `reception@hospital.com`, password `password123`

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Security Features

- JWT-based authentication
- Role-based authorization
- Medical records access control
- Password hashing with bcrypt
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
