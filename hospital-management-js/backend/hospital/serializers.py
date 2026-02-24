from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Department, Doctor, Patient, Appointment, MedicalRecord

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role']
        read_only_fields = ['id']

class DepartmentSerializer(serializers.ModelSerializer):
    head_doctor_name = serializers.CharField(source='head_doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'head_doctor', 'head_doctor_name', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialization', 'license_number', 'department', 'department_name', 
                  'experience_years', 'consultation_fee', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DoctorCreateSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(write_only=True)
    user_first_name = serializers.CharField(write_only=True)
    user_last_name = serializers.CharField(write_only=True)
    user_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Doctor
        fields = ['user_email', 'user_first_name', 'user_last_name', 'user_phone',
                  'specialization', 'license_number', 'department', 'experience_years', 
                  'consultation_fee', 'status']
    
    def create(self, validated_data):
        user_data = {
            'email': validated_data.pop('user_email'),
            'first_name': validated_data.pop('user_first_name'),
            'last_name': validated_data.pop('user_last_name'),
            'phone': validated_data.pop('user_phone', ''),
            'role': 'DOCTOR'
        }
        
        # Create user with a temporary password
        import uuid
        temp_password = str(uuid.uuid4())[:8]
        user = User.objects.create_user(
            username=user_data['email'],
            password=temp_password,
            **user_data
        )
        
        return Doctor.objects.create(user=user, **validated_data)

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = ['id', 'user', 'first_name', 'last_name', 'full_name', 'date_of_birth', 
                  'gender', 'phone', 'email', 'address', 'emergency_contact_name', 
                  'emergency_contact_phone', 'blood_group', 'medical_history', 'allergies',
                  'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PatientCreateSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    user_first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Patient
        fields = ['user_email', 'user_first_name', 'user_last_name', 'user_phone',
                  'first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'email', 
                  'address', 'emergency_contact_name', 'emergency_contact_phone', 
                  'blood_group', 'medical_history', 'allergies', 'status']
    
    def create(self, validated_data):
        user_email = validated_data.pop('user_email', None)
        user_first_name = validated_data.pop('user_first_name', None)
        user_last_name = validated_data.pop('user_last_name', None)
        user_phone = validated_data.pop('user_phone', None)
        
        user = None
        if user_email and user_first_name and user_last_name:
            # Create user account for patient
            import uuid
            temp_password = str(uuid.uuid4())[:8]
            user = User.objects.create_user(
                username=user_email,
                email=user_email,
                first_name=user_first_name,
                last_name=user_last_name,
                phone=user_phone or '',
                password=temp_password,
                role='PATIENT'
            )
        
        return Patient.objects.create(user=user, **validated_data)

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    # Enhanced nested data for frontend
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_name', 'patient_phone', 'doctor', 'doctor_name', 
                  'doctor_specialization', 'appointment_date', 'appointment_time', 'duration_minutes',
                  'type', 'status', 'notes', 'symptoms', 'diagnosis', 'prescription', 
                  'fee_paid', 'fee_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['patient', 'doctor', 'appointment_date', 'appointment_time', 'duration_minutes',
                  'type', 'notes', 'symptoms', 'fee_amount']

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'appointment',
                  'diagnosis', 'symptoms', 'prescription', 'notes', 'follow_up_date',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DashboardStatsSerializer(serializers.Serializer):
    total_patients = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    completed_appointments = serializers.IntegerField()
    departments_count = serializers.IntegerField()
    today_appointments_count = serializers.IntegerField()
    recent_appointments = serializers.ListField(child=serializers.DictField())
