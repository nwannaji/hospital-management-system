from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from datetime import date, datetime, timedelta
from .models import Department, Doctor, Patient, Appointment, MedicalRecord
from .serializers import (
    DepartmentSerializer, DoctorSerializer, DoctorCreateSerializer,
    PatientSerializer, PatientCreateSerializer, AppointmentSerializer, 
    AppointmentCreateSerializer, MedicalRecordSerializer, DashboardStatsSerializer,
    UserSerializer
)

User = get_user_model()

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.filter(status='ACTIVE')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user', 'department').filter(status='ACTIVE')
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorCreateSerializer
        return DoctorSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active doctors"""
        doctors = self.queryset.filter(status='ACTIVE')
        serializer = self.get_serializer(doctors, many=True)
        return Response(serializer.data)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user').filter(status='ACTIVE')
    serializer_class = PatientSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PatientCreateSerializer
        return PatientSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active patients"""
        patients = self.queryset.filter(status='ACTIVE')
        serializer = self.get_serializer(patients, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search patients by name or phone"""
        query = request.query_params.get('q', '')
        patients = self.queryset.filter(
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query) | 
            Q(phone__icontains=query) |
            Q(email__icontains=query)
        )
        serializer = self.get_serializer(patients, many=True)
        return Response(serializer.data)

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient', 'doctor__user').order_by('appointment_date', 'appointment_time')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(appointment_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(appointment_date__lte=date_to)
        
        # Filter by doctor if provided
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        
        # Filter by patient if provided
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's appointments"""
        today = date.today()
        appointments = self.queryset.filter(appointment_date=today)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        today = date.today()
        appointments = self.queryset.filter(
            appointment_date__gte=today,
            status='SCHEDULED'
        ).order_by('appointment_date', 'appointment_time')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        """Get all scheduled appointments with enhanced patient/doctor data"""
        appointments = self.queryset.filter(status='SCHEDULED')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an appointment"""
        appointment = self.get_object()
        appointment.status = 'COMPLETED'
        appointment.save()
        
        # Create medical record if diagnosis provided
        diagnosis = request.data.get('diagnosis', None)
        if diagnosis:
            MedicalRecord.objects.create(
                patient=appointment.patient,
                doctor=appointment.doctor,
                appointment=appointment,
                diagnosis=diagnosis,
                symptoms=request.data.get('symptoms', ''),
                prescription=request.data.get('prescription', ''),
                notes=request.data.get('notes', ''),
                follow_up_date=request.data.get('follow_up_date', None)
            )
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        appointment.status = 'CANCELLED'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.select_related('patient', 'doctor__user', 'appointment').order_by('-created_at')
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by patient if provided
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by doctor if provided
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent medical records"""
        records = self.queryset[:20]  # Last 20 records
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def dashboard_stats(request):
    """Get dashboard statistics"""
    today = date.today()
    
    # Basic counts
    total_patients = Patient.objects.filter(status='ACTIVE').count()
    total_doctors = Doctor.objects.filter(status='ACTIVE').count()
    total_appointments = Appointment.objects.count()
    scheduled_appointments = Appointment.objects.filter(status='SCHEDULED').count()
    completed_appointments = Appointment.objects.filter(status='COMPLETED').count()
    departments_count = Department.objects.filter(status='ACTIVE').count()
    
    # Today's appointments
    today_appointments = Appointment.objects.filter(
        appointment_date=today
    ).select_related('patient', 'doctor__user').order_by('appointment_time')
    
    # Recent appointments (last 7 days) - use the same serializer as main appointments endpoint
    recent_date = today - timedelta(days=7)
    recent_appointments = Appointment.objects.filter(
        appointment_date__gte=recent_date
    ).select_related('patient', 'doctor__user').order_by('-appointment_date', '-appointment_time')[:10]
    
    # Use the AppointmentSerializer to get consistent data
    recent_appointments_data = AppointmentSerializer(recent_appointments, many=True).data
    
    stats = {
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'scheduled_appointments': scheduled_appointments,
        'completed_appointments': completed_appointments,
        'departments_count': departments_count,
        'today_appointments_count': today_appointments.count(),
        'recent_appointments': recent_appointments_data
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'database': 'postgresql',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_info(request):
    """API information endpoint"""
    return Response({
        'name': 'Hospital Management System API',
        'version': '1.0.0',
        'framework': 'Django REST Framework',
        'database': 'PostgreSQL 17',
        'endpoints': {
            'departments': '/api/departments/',
            'doctors': '/api/doctors/',
            'patients': '/api/patients/',
            'appointments': '/api/appointments/',
            'medical_records': '/api/medical-records/',
            'dashboard': '/api/dashboard/stats/',
            'health': '/api/health/'
        }
    })
