import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ScanLine } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge, statusBadgeVariant } from '../../components/ui/Badge';
import type { Event, Organization, EventSession } from '../../types';
import toast from 'react-hot-toast';

export function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    organization_ids: [] as number[],
  });
  const [sessions, setSessions] = useState<{ name: string; start_time: string; end_time: string }[]>([]);
  const [newSession, setNewSession] = useState({ name: '', start_time: '', end_time: '' });

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data as Organization[];
    },
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data.data as Event;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date,
        organization_ids: event.organizations?.map((o) => o.id) || [],
      });
      setSessions(
        event.sessions?.map((s) => ({
          name: s.name,
          start_time: s.start_time.slice(0, 16),
          end_time: s.end_time.slice(0, 16),
        })) || []
      );
    }
  }, [event]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, sessions: isEdit ? undefined : sessions };
      if (isEdit) {
        return api.put(`/events/${id}`, form);
      }
      return api.post('/events', payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(isEdit ? 'Event updated' : 'Event created');
      navigate(`/events/manage/${res.data.data.id}`);
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/events/${id}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success('Event submitted for approval');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/events/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success('Event marked as completed');
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: (session: typeof newSession) => api.post(`/events/${id}/sessions`, session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setNewSession({ name: '', start_time: '', end_time: '' });
      toast.success('Session added');
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => api.delete(`/events/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success('Session deleted');
    },
  });

  const toggleOrg = (orgId: number) => {
    setForm((prev) => ({
      ...prev,
      organization_ids: prev.organization_ids.includes(orgId)
        ? prev.organization_ids.filter((id) => id !== orgId)
        : [...prev.organization_ids, orgId],
    }));
  };

  if (isEdit && isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h1>
          {event && <Badge variant={statusBadgeVariant(event.status)} className="mt-2">{event.status}</Badge>}
        </div>
        {isEdit && event && (
          <div className="flex gap-2">
            {event.status === 'draft' && (
              <Button variant="secondary" onClick={() => submitMutation.mutate()}>Submit for Approval</Button>
            )}
            {event.status === 'approved' && (
              <Button variant="secondary" onClick={() => completeMutation.mutate()}>Mark Complete</Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Event Details</h2></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Organizations</label>
            <div className="flex flex-wrap gap-2">
              {orgs?.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => toggleOrg(org.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm border ${
                    form.organization_ids.includes(org.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Event'}
          </Button>
        </CardContent>
      </Card>

      {!isEdit && (
        <Card>
          <CardHeader><h2 className="font-semibold">Sessions</h2></CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                <span>{session.name}</span>
                <span className="text-slate-400">|</span>
                <span>{session.start_time}</span>
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-3">
              <Input placeholder="Session name" value={newSession.name} onChange={(e) => setNewSession({ ...newSession, name: e.target.value })} />
              <Input type="datetime-local" value={newSession.start_time} onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })} />
              <Input type="datetime-local" value={newSession.end_time} onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })} />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (newSession.name && newSession.start_time && newSession.end_time) {
                  setSessions([...sessions, newSession]);
                  setNewSession({ name: '', start_time: '', end_time: '' });
                }
              }}
            >
              <Plus className="h-4 w-4" /> Add Session
            </Button>
          </CardContent>
        </Card>
      )}

      {isEdit && event?.sessions && (
        <Card>
          <CardHeader><h2 className="font-semibold">Sessions</h2></CardHeader>
          <CardContent className="space-y-3">
            {event.sessions.map((session: EventSession) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-medium">{session.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(session.start_time).toLocaleString()} — {new Date(session.end_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(event.status === 'approved' || event.status === 'completed') && (
                    <Button size="sm" onClick={() => navigate(`/attendance/${session.id}`)}>
                      <ScanLine className="h-4 w-4" /> Attendance
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteSessionMutation.mutate(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input placeholder="Session name" value={newSession.name} onChange={(e) => setNewSession({ ...newSession, name: e.target.value })} />
                <Input type="datetime-local" value={newSession.start_time} onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })} />
                <Input type="datetime-local" value={newSession.end_time} onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })} />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addSessionMutation.mutate(newSession)}
                disabled={!newSession.name || !newSession.start_time || !newSession.end_time}
              >
                <Plus className="h-4 w-4" /> Add Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
