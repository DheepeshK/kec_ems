import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { Organization } from '../../types';
import toast from 'react-hot-toast';

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form, setForm] = useState({ name: '', type: 'club', description: '' });

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data as Organization[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editing) {
        return api.put(`/organizations/${editing.id}`, data);
      }
      return api.post('/organizations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success(editing ? 'Organization updated' : 'Organization created');
      closeModal();
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/organizations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deactivated');
    },
  });

  const logoMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      return api.post(`/organizations/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Logo uploaded');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', type: 'club', description: '' });
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditing(org);
    setForm({ name: org.name, type: org.type, description: org.description || '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="text-slate-600">Manage clubs, cells, forums, and departments</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Organization</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table headers={['Name', 'Type', 'Logo', 'Actions']}>
            {orgs?.map((org) => (
              <tr key={org.id}>
                <td className="px-4 py-3 text-sm font-medium">{org.name}</td>
                <td className="px-4 py-3 text-sm"><Badge>{org.type}</Badge></td>
                <td className="px-4 py-3 text-sm">
                  {org.logo_path ? (
                    <img src={org.logo_path} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <label className="cursor-pointer text-primary-600 hover:text-primary-700">
                      <Upload className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) logoMutation.mutate({ id: org.id, file });
                        }}
                      />
                    </label>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(org)} className="text-slate-600 hover:text-primary-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(org.id)} className="text-slate-600 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Organization' : 'New Organization'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="club">Club</option>
            <option value="cell">Cell</option>
            <option value="forum">Forum</option>
            <option value="department">Department</option>
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
