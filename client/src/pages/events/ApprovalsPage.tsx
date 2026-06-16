import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { Event } from '../../types';
import toast from 'react-hot-toast';

export function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['pending-events'],
    queryFn: async () => {
      const res = await api.get('/events/pending');
      return res.data.data as Event[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, comment }: { id: number; action: 'approve' | 'reject'; comment: string }) => {
      const orgId = events?.find((e) => e.id === id)?.organizations?.[0]?.id;
      return api.post(`/events/${id}/${action}`, { organization_id: orgId, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-events'] });
      toast.success(action === 'approve' ? 'Event approved' : 'Event rejected');
      setSelectedEvent(null);
      setAction(null);
      setComment('');
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Event Approvals</h1>
        <p className="text-slate-600">Review and approve pending events</p>
      </div>

      {events?.length === 0 ? (
        <Card><CardContent className="text-center text-slate-500 py-8">No pending approvals</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {events?.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                    <p className="text-sm text-slate-500">{event.start_date} — {event.end_date}</p>
                    <p className="text-sm text-slate-500">By: {event.creator_name}</p>
                    {event.organizations && (
                      <div className="flex gap-2 mt-2">
                        {event.organizations.map((org) => (
                          <Badge key={org.id}>{org.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setSelectedEvent(event); setAction('approve'); }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => { setSelectedEvent(event); setAction('reject'); }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={selectedEvent !== null && action !== null}
        onClose={() => { setSelectedEvent(null); setAction(null); }}
        title={action === 'approve' ? 'Approve Event' : 'Reject Event'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{selectedEvent?.title}</p>
          <Input
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setSelectedEvent(null); setAction(null); }}>Cancel</Button>
            <Button
              variant={action === 'reject' ? 'danger' : 'primary'}
              onClick={() => {
                if (selectedEvent && action) {
                  actionMutation.mutate({ id: selectedEvent.id, action, comment });
                }
              }}
              disabled={actionMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
