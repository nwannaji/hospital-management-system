import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../api';

function StatCard({ title, value, icon, color, bgColor }) {
  return (
    <div className="medical-card">
      <div className="medical-card-content">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-primary/10 rounded-full">
        <CalendarIcon className="h-5 w-5 text-medical-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{activity.description}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, icon, color, bgColor, to }) {
  return (
    <Link
      to={to}
      className={`medical-card hover:shadow-md transition-shadow cursor-pointer group`}
    >
      <div className="medical-card-content">
        <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Real-time hospital statistics and quick access to critical information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats?.total_patients || 0}
          icon={<UserCircleIcon className="h-8 w-8" />}
          color="medical-primary"
          bgColor="medical-primary"
        />
        <StatCard
          title="Total Doctors"
          value={stats?.total_doctors || 0}
          icon={<UserGroupIcon className="h-8 w-8" />}
          color="medical-success"
          bgColor="medical-success"
        />
        <StatCard
          title="Total Appointments"
          value={stats?.total_appointments || 0}
          icon={<CalendarIcon className="h-8 w-8" />}
          color="medical-warning"
          bgColor="medical-warning"
        />
        <StatCard
          title="Scheduled"
          value={stats?.scheduled_appointments || 0}
          icon={<CalendarIcon className="h-8 w-8" />}
          color="medical-info"
          bgColor="medical-info"
        />
        <StatCard
          title="Completed"
          value={stats?.completed_appointments || 0}
          icon={<CalendarIcon className="h-8 w-8" />}
          color="medical-success"
          bgColor="medical-success"
        />
        <StatCard
          title="Departments"
          value={stats?.departments_count || 0}
          icon={<BuildingOfficeIcon className="h-8 w-8" />}
          color="medical-secondary"
          bgColor="medical-secondary"
        />
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="medical-card">
          <div className="medical-card-header">
            <h2 className="text-lg font-semibold text-foreground">Recent Activities</h2>
          </div>
          <div className="medical-card-content">
            <div className="space-y-4">
              {stats?.recent_activities?.length > 0 ? (
                stats.recent_activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="medical-card">
          <div className="medical-card-header">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="medical-card-content">
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                title="Add Patient"
                icon={<PlusIcon className="h-6 w-6 text-medical-primary" />}
                color="text-medical-primary"
                bgColor="bg-primary/10"
                to="/patients/new"
              />
              <QuickActionCard
                title="Schedule Appointment"
                icon={<CalendarIcon className="h-6 w-6 text-medical-success" />}
                color="text-medical-success"
                bgColor="bg-medical-success/10"
                to="/appointments/new"
              />
              <QuickActionCard
                title="New Medical Record"
                icon={<DocumentTextIcon className="h-6 w-6 text-medical-secondary" />}
                color="text-medical-secondary"
                bgColor="bg-medical-secondary/10"
                to="/records/new"
              />
              <QuickActionCard
                title="Assign Room"
                icon={<BuildingOfficeIcon className="h-6 w-6 text-medical-warning" />}
                color="text-medical-warning"
                bgColor="bg-medical-warning/10"
                to="/rooms/assign"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
