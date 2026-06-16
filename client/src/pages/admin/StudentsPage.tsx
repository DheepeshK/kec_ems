import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import type { Student } from '../../types';
import toast from 'react-hot-toast';

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ roll_number: '', barcode: '', name: '', department: '' });
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; errors: { line: number; message: string }[]; total: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search],
    queryFn: async () => {
      const res = await api.get('/students', { params: { page, limit: 20, search } });
      return res.data.data as { students: Student[]; total: number; page: number; limit: number };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editing) return api.put(`/students/${editing.id}`, data);
      return api.post('/students', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(editing ? 'Student updated' : 'Student created');
      closeModal();
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted');
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Imported ${result.inserted} students`);
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Import failed');
    },
  });

  const downloadTemplate = () => {
    const csv = 'roll_number,barcode,name,department\n21CS001,BC21001,John Doe,CSE';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ roll_number: '', barcode: '', name: '', department: '' });
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      roll_number: student.roll_number,
      barcode: student.barcode,
      name: student.name,
      department: student.department || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  const totalPages = Math.ceil((data?.total || 0) / 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-600">Manage student records for attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={downloadTemplate}><Download className="h-4 w-4" /> Template</Button>
          <Button variant="secondary" onClick={() => { setImportResult(null); setImportModalOpen(true); }}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      <Input
        placeholder="Search by roll number, name, barcode..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <Card>
        <CardContent className="p-0">
          <Table headers={['Roll Number', 'Barcode', 'Name', 'Department', 'Actions']}>
            {data?.students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 text-sm font-medium">{student.roll_number}</td>
                <td className="px-4 py-3 text-sm">{student.barcode}</td>
                <td className="px-4 py-3 text-sm">{student.name}</td>
                <td className="px-4 py-3 text-sm">{student.department || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(student)} className="text-slate-600 hover:text-primary-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(student.id)} className="text-slate-600 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Student' : 'New Student'}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
          <Input label="Roll Number" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required />
          <Input label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Students CSV" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">CSV must have columns: roll_number, barcode, name, department</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMutation.mutate(file);
            }}
            className="block w-full text-sm"
          />
          {importMutation.isPending && <p className="text-sm text-slate-500">Importing...</p>}
          {importResult && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
              <p><strong>Total rows:</strong> {importResult.total}</p>
              <p><strong>Inserted:</strong> {importResult.inserted}</p>
              <p><strong>Skipped:</strong> {importResult.skipped}</p>
              {importResult.errors.length > 0 && (
                <div>
                  <p className="font-medium text-red-600">Errors:</p>
                  <ul className="mt-1 list-disc pl-5 text-red-600">
                    {importResult.errors.slice(0, 10).map((err) => (
                      <li key={err.line}>Line {err.line}: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
