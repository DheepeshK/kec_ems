import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Building2, Users, Clock } from 'lucide-react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge, statusBadgeVariant } from '../components/ui/Badge';
import type { DashboardStats } from '../types';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data as DashboardStats;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  const stats = data!;

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Organizations', value: stats.activeOrganizations, icon: Building2, color: 'text-green-600 bg-green-100' },
    { label: 'Attendance Today', value: stats.attendanceToday, icon: Users, color: 'text-purple-600 bg-purple-100' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Overview of event management activities</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Events</h2>
        </div>
        <CardContent className="p-0">
          {stats.recentEvents.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-500">No events yet</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {stats.recentEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/manage/${event.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">
                      {event.start_date} — {event.creator_name}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
