import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge, statusBadgeVariant } from '../../components/ui/Badge';
import type { Event } from '../../types';

export function PublicEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const res = await api.get('/public/events');
      return res.data.data as { events: Event[]; total: number };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Events</h1>
      <p className="mt-2 text-slate-600">Browse approved and completed institutional events</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.events.length === 0 ? (
          <p className="text-slate-500">No public events available</p>
        ) : (
          data?.events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-primary-300 transition-colors"
            >
              <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>
              <h3 className="mt-3 font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{event.start_date} — {event.end_date}</p>
              {event.organizations && (
                <p className="mt-2 text-sm text-slate-600">
                  {event.organizations.map((o) => o.name).join(', ')}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
