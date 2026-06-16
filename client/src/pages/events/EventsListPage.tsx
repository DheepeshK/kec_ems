import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge, statusBadgeVariant } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { useState } from 'react';
import type { Event } from '../../types';

export function EventsListPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', statusFilter],
    queryFn: async () => {
      const res = await api.get('/events', { params: { status: statusFilter || undefined } });
      return res.data.data as { events: Event[]; total: number };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-600">Manage institutional events</p>
        </div>
        <Link to="/events/manage/new">
          <Button><Plus className="h-4 w-4" /> Create Event</Button>
        </Link>
      </div>

      <Select label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="completed">Completed</option>
      </Select>

      <div className="grid gap-4">
        {data?.events.length === 0 ? (
          <Card><CardContent className="text-center text-slate-500 py-8">No events found</CardContent></Card>
        ) : (
          data?.events.map((event) => (
            <Link key={event.id} to={`/events/manage/${event.id}`}>
              <Card className="hover:border-primary-300 transition-colors">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500">{event.start_date} — {event.end_date}</p>
                    {event.organizations && (
                      <p className="text-sm text-slate-500 mt-1">
                        {event.organizations.map((o) => o.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
