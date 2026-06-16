import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge, statusBadgeVariant } from '../../components/ui/Badge';
import type { Event } from '../../types';

export function PublicEventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ['public-event', id],
    queryFn: async () => {
      const res = await api.get(`/public/events/${id}`);
      return res.data.data as Event;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  if (!event) return <p className="text-center py-12 text-slate-500">Event not found</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{event.title}</h1>
      <p className="mt-2 text-slate-600">{event.start_date} — {event.end_date}</p>

      {event.description && (
        <p className="mt-6 text-slate-700">{event.description}</p>
      )}

      {event.organizations && event.organizations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-slate-900">Organizations</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {event.organizations.map((org) => (
              <span key={org.id} className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {org.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {event.sessions && event.sessions.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-slate-900">Sessions</h2>
          <div className="mt-3 space-y-3">
            {event.sessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium">{session.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(session.start_time).toLocaleString()} — {new Date(session.end_time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
