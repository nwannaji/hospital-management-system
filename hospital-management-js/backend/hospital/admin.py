from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Doctor, Patient, Appointment, MedicalRecord

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'role'),
        }),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'head_doctor', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'department', 'license_number', 'status', 'experience_years')
    list_filter = ('status', 'department', 'specialization')
    search_fields = ('user__first_name', 'user__last_name', 'specialization', 'license_number')
    ordering = ('user__last_name', 'user__first_name')
    
    fieldsets = (
        (None, {'fields': ('user', 'specialization', 'license_number')}),
        ('Professional Info', {'fields': ('department', 'experience_years', 'consultation_fee')}),
        ('Status', {'fields': ('status',)}),
    )

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'gender', 'phone', 'email', 'status', 'created_at')
    list_filter = ('gender', 'status', 'created_at')
    search_fields = ('first_name', 'last_name', 'phone', 'email')
    ordering = ('last_name', 'first_name')
    
    fieldsets = (
        (None, {'fields': ('first_name', 'last_name', 'date_of_birth', 'gender')}),
        ('Contact Info', {'fields': ('phone', 'email', 'address')}),
        ('Emergency Contact', {'fields': ('emergency_contact_name', 'emergency_contact_phone')}),
        ('Medical Info', {'fields': ('blood_group', 'medical_history', 'allergies')}),
        ('Status', {'fields': ('status',)}),
    )

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment_date', 'appointment_time', 'type', 'status', 'fee_paid')
    list_filter = ('status', 'type', 'appointment_date', 'fee_paid')
    search_fields = ('patient__first_name', 'patient__last_name', 'doctor__user__first_name', 'doctor__user__last_name')
    ordering = ('-appointment_date', '-appointment_time')
    date_hierarchy = 'appointment_date'
    
    fieldsets = (
        (None, {'fields': ('patient', 'doctor', 'appointment_date', 'appointment_time')}),
        ('Appointment Details', {'fields': ('type', 'duration_minutes', 'notes', 'symptoms')}),
        ('Medical Info', {'fields': ('diagnosis', 'prescription')}),
        ('Financial', {'fields': ('fee_amount', 'fee_paid')}),
        ('Status', {'fields': ('status',)}),
    )

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment', 'created_at', 'follow_up_date')
    list_filter = ('created_at', 'follow_up_date')
    search_fields = ('patient__first_name', 'patient__last_name', 'doctor__user__first_name', 'doctor__user__last_name')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {'fields': ('patient', 'doctor', 'appointment')}),
        ('Diagnosis', {'fields': ('diagnosis', 'symptoms')}),
        ('Treatment', {'fields': ('prescription', 'notes')}),
        ('Follow-up', {'fields': ('follow_up_date',)}),
    )

# Customize admin site
admin.site.site_header = 'Hospital Management System'
admin.site.site_title = 'Hospital Admin'
admin.site.index_title = 'Welcome to Hospital Management System'
