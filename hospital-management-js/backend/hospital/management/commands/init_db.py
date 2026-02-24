from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
import uuid

from hospital.models import Department, Doctor, Patient, Appointment, MedicalRecord

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialize the hospital management database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('🏥 Initializing Hospital Management Database...')
        
        # Create departments
        self.stdout.write('📋 Creating departments...')
        departments_data = [
            {'name': 'Cardiology', 'description': 'Heart and cardiovascular diseases'},
            {'name': 'Neurology', 'description': 'Brain and nervous system disorders'},
            {'name': 'Orthopedics', 'description': 'Bone and joint disorders'},
            {'name': 'Pediatrics', 'description': 'Children healthcare'},
            {'name': 'General Medicine', 'description': 'General healthcare services'},
        ]
        
        departments = []
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults=dept_data
            )
            departments.append(dept)
            if created:
                self.stdout.write(f'  ✅ Created department: {dept.name}')
            else:
                self.stdout.write(f'  📋 Department already exists: {dept.name}')
        
        # Create doctors
        self.stdout.write('👨‍⚕️ Creating doctors...')
        doctors_data = [
            {
                'email': 'dr.alice.johnson@hospital.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'specialization': 'Cardiology',
                'license_number': 'DOC12345',
                'department': departments[0],  # Cardiology
                'experience_years': 10,
                'consultation_fee': 150.00,
            },
            {
                'email': 'dr.bob.smith@hospital.com',
                'first_name': 'Bob',
                'last_name': 'Smith',
                'specialization': 'Neurology',
                'license_number': 'DOC12346',
                'department': departments[1],  # Neurology
                'experience_years': 8,
                'consultation_fee': 200.00,
            },
            {
                'email': 'dr.carol.davis@hospital.com',
                'first_name': 'Carol',
                'last_name': 'Davis',
                'specialization': 'Orthopedics',
                'license_number': 'DOC12347',
                'department': departments[2],  # Orthopedics
                'experience_years': 12,
                'consultation_fee': 175.00,
            },
            {
                'email': 'dr.david.wilson@hospital.com',
                'first_name': 'David',
                'last_name': 'Wilson',
                'specialization': 'Pediatrics',
                'license_number': 'DOC12348',
                'department': departments[3],  # Pediatrics
                'experience_years': 6,
                'consultation_fee': 120.00,
            },
        ]
        
        doctors = []
        for doc_data in doctors_data:
            # Create user for doctor
            user, user_created = User.objects.get_or_create(
                email=doc_data['email'],
                defaults={
                    'username': doc_data['email'],
                    'first_name': doc_data['first_name'],
                    'last_name': doc_data['last_name'],
                    'role': 'DOCTOR',
                }
            )
            
            if user_created:
                user.set_password('doctor123')
                user.save()
                self.stdout.write(f'  👤 Created doctor user: {user.email}')
            
            # Create doctor profile
            doctor, doctor_created = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'specialization': doc_data['specialization'],
                    'license_number': doc_data['license_number'],
                    'department': doc_data['department'],
                    'experience_years': doc_data['experience_years'],
                    'consultation_fee': doc_data['consultation_fee'],
                }
            )
            doctors.append(doctor)
            
            if doctor_created:
                self.stdout.write(f'  ✅ Created doctor: Dr. {doctor.user.first_name} {doctor.user.last_name}')
            else:
                self.stdout.write(f'  👨‍⚕️ Doctor already exists: Dr. {doctor.user.first_name} {doctor.user.last_name}')
        
        # Create patients
        self.stdout.write('👥 Creating patients...')
        patients_data = [
            {
                'first_name': 'John',
                'last_name': 'Doe',
                'date_of_birth': date(1985, 5, 15),
                'gender': 'MALE',
                'phone': '+1234567890',
                'email': 'john.doe@email.com',
                'address': '123 Main St, City, State',
                'emergency_contact_name': 'Jane Doe',
                'emergency_contact_phone': '+1234567891',
                'blood_group': 'O+',
            },
            {
                'first_name': 'Jane',
                'last_name': 'Smith',
                'date_of_birth': date(1990, 8, 22),
                'gender': 'FEMALE',
                'phone': '+1234567892',
                'email': 'jane.smith@email.com',
                'address': '456 Oak Ave, City, State',
                'emergency_contact_name': 'Bob Smith',
                'emergency_contact_phone': '+1234567893',
                'blood_group': 'A+',
            },
            {
                'first_name': 'Michael',
                'last_name': 'Johnson',
                'date_of_birth': date(2000, 3, 10),
                'gender': 'MALE',
                'phone': '+1234567894',
                'email': 'michael.johnson@email.com',
                'address': '789 Pine Rd, City, State',
                'emergency_contact_name': 'Sarah Johnson',
                'emergency_contact_phone': '+1234567895',
                'blood_group': 'B+',
            },
            {
                'first_name': 'Emily',
                'last_name': 'Brown',
                'date_of_birth': date(1995, 12, 5),
                'gender': 'FEMALE',
                'phone': '+1234567896',
                'email': 'emily.brown@email.com',
                'address': '321 Elm St, City, State',
                'emergency_contact_name': 'Tom Brown',
                'emergency_contact_phone': '+1234567897',
                'blood_group': 'AB+',
            },
        ]
        
        patients = []
        for patient_data in patients_data:
            patient, created = Patient.objects.get_or_create(
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                defaults=patient_data
            )
            patients.append(patient)
            
            if created:
                self.stdout.write(f'  ✅ Created patient: {patient.first_name} {patient.last_name}')
            else:
                self.stdout.write(f'  👤 Patient already exists: {patient.first_name} {patient.last_name}')
        
        # Create appointments
        self.stdout.write('📅 Creating appointments...')
        today = date.today()
        appointments_data = [
            {
                'patient': patients[0],  # John Doe
                'doctor': doctors[0],    # Dr. Alice Johnson (Cardiology)
                'appointment_date': today + timedelta(days=1),
                'appointment_time': '09:00',
                'type': 'CONSULTATION',
                'notes': 'Regular checkup',
                'fee_amount': 150.00,
            },
            {
                'patient': patients[1],  # Jane Smith
                'doctor': doctors[1],    # Dr. Bob Smith (Neurology)
                'appointment_date': today + timedelta(days=2),
                'appointment_time': '10:30',
                'type': 'FOLLOW_UP',
                'notes': 'Follow-up on treatment',
                'fee_amount': 200.00,
            },
            {
                'patient': patients[2],  # Michael Johnson
                'doctor': doctors[2],    # Dr. Carol Davis (Orthopedics)
                'appointment_date': today,
                'appointment_time': '14:00',
                'type': 'CONSULTATION',
                'notes': 'Knee pain consultation',
                'fee_amount': 175.00,
            },
            {
                'patient': patients[3],  # Emily Brown
                'doctor': doctors[3],    # Dr. David Wilson (Pediatrics)
                'appointment_date': today + timedelta(days=3),
                'appointment_time': '11:00',
                'type': 'CHECKUP',
                'notes': 'Annual checkup',
                'fee_amount': 120.00,
            },
            {
                'patient': patients[0],  # John Doe
                'doctor': doctors[0],    # Dr. Alice Johnson (Cardiology)
                'appointment_date': today - timedelta(days=1),
                'appointment_time': '15:30',
                'type': 'CONSULTATION',
                'status': 'COMPLETED',
                'notes': 'Completed heart checkup',
                'fee_amount': 150.00,
                'fee_paid': True,
            },
        ]
        
        for appt_data in appointments_data:
            appointment, created = Appointment.objects.get_or_create(
                patient=appt_data['patient'],
                doctor=appt_data['doctor'],
                appointment_date=appt_data['appointment_date'],
                appointment_time=appt_data['appointment_time'],
                defaults=appt_data
            )
            
            if created:
                self.stdout.write(f'  ✅ Created appointment: {appointment.patient.full_name} with Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}')
            else:
                self.stdout.write(f'  📅 Appointment already exists')
        
        # Create medical records for completed appointments
        self.stdout.write('📋 Creating medical records...')
        completed_appointments = Appointment.objects.filter(status='COMPLETED')
        
        for appointment in completed_appointments:
            medical_record, created = MedicalRecord.objects.get_or_create(
                appointment=appointment,
                defaults={
                    'patient': appointment.patient,
                    'doctor': appointment.doctor,
                    'diagnosis': 'Patient shows normal heart function',
                    'symptoms': 'Mild chest discomfort',
                    'prescription': 'Prescribed medication for heart health',
                    'notes': 'Patient advised to maintain healthy lifestyle',
                    'follow_up_date': today + timedelta(days=30),
                }
            )
            
            if created:
                self.stdout.write(f'  ✅ Created medical record for: {appointment.patient.full_name}')
        
        # Create admin user
        self.stdout.write('👑 Creating admin user...')
        admin_user, created = User.objects.get_or_create(
            email='admin@hospital.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('  ✅ Created admin user: admin@hospital.com')
        else:
            self.stdout.write('  👤 Admin user already exists')
        
        self.stdout.write('\n🎉 Database initialization completed successfully!')
        self.stdout.write('\n📊 Summary:')
        self.stdout.write(f'  📋 Departments: {Department.objects.count()}')
        self.stdout.write(f'  👨‍⚕️ Doctors: {Doctor.objects.count()}')
        self.stdout.write(f'  👥 Patients: {Patient.objects.count()}')
        self.stdout.write(f'  📅 Appointments: {Appointment.objects.count()}')
        self.stdout.write(f'  📋 Medical Records: {MedicalRecord.objects.count()}')
        
        self.stdout.write('\n🔐 Login Credentials:')
        self.stdout.write('  Admin: admin@hospital.com / admin123')
        self.stdout.write('  Doctors: dr.alice.johnson@hospital.com / doctor123')
        self.stdout.write('  (and other doctors with same password)')
        
        self.stdout.write('\n🌐 API Endpoints:')
        self.stdout.write('  http://localhost:8000/api/')
        self.stdout.write('  http://localhost:8000/api/info/')
        self.stdout.write('  http://localhost:8000/api/health/')
        self.stdout.write('  http://localhost:8000/admin/')
