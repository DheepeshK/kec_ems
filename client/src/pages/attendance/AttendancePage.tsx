import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrowserMultiFormatReader } from '@zxing/library';
import { ScanLine, Keyboard } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { AttendanceRecord } from '../../types';
import toast from 'react-hot-toast';

export function AttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [rollNumber, setRollNumber] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: async () => {
      const res = await api.get(`/sessions/${sessionId}/attendance`);
      return res.data.data as { attendance: AttendanceRecord[]; count: number };
    },
    refetchInterval: 5000,
  });

  const markMutation = useMutation({
    mutationFn: async (data: { barcode?: string; roll_number?: string }) => {
      if (data.barcode) {
        return api.post(`/sessions/${sessionId}/attendance/scan`, { barcode: data.barcode });
      }
      return api.post(`/sessions/${sessionId}/attendance/manual`, { roll_number: data.roll_number });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] });
      toast.success(`Marked: ${res.data.data.name}`);
      setRollNumber('');
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(message);
    },
  });

  const handleScan = useCallback((barcode: string) => {
    if (!barcode) return;
    markMutation.mutate({ barcode });
  }, [markMutation]);

  useEffect(() => {
    if (mode !== 'scan' || !scanning) return;

    if (!videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        handleScan(result.getText());
      }
      if (err && !(err.name === 'NotFoundException')) {
        console.debug('Scan error:', err);
      }
    }).catch((err) => {
      console.error('Camera error:', err);
      toast.error('Could not access camera. Use manual entry.');
      setScanning(false);
    });

    return () => {
      reader.reset();
    };
  }, [mode, scanning, handleScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollNumber.trim()) {
      markMutation.mutate({ roll_number: rollNumber.trim() });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-600">
          Session #{sessionId} — <strong>{attendance?.count || 0}</strong> present
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={mode === 'scan' ? 'primary' : 'secondary'}
          onClick={() => { setMode('scan'); setScanning(true); }}
        >
          <ScanLine className="h-4 w-4" /> Barcode Scan
        </Button>
        <Button
          variant={mode === 'manual' ? 'primary' : 'secondary'}
          onClick={() => { setMode('manual'); setScanning(false); }}
        >
          <Keyboard className="h-4 w-4" /> Manual Entry
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Mark Attendance</h2></CardHeader>
          <CardContent>
            {mode === 'scan' ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button onClick={() => setScanning(true)}>Start Camera</Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 text-center">Point camera at student ID barcode</p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <Input
                  label="Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number"
                  required
                />
                <Button type="submit" disabled={markMutation.isPending} className="w-full">
                  Mark Present
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Attendance List ({attendance?.count || 0})</h2>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {attendance?.attendance.length === 0 ? (
              <p className="px-6 py-8 text-center text-slate-500">No attendance recorded yet</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {attendance?.attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-medium text-sm">{record.name}</p>
                      <p className="text-xs text-slate-500">{record.roll_number} — {record.department}</p>
                    </div>
                    <Badge variant={record.method === 'barcode' ? 'info' : 'default'}>
                      {record.method}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
