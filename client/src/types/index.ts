export type UserRole = 'super_admin' | 'club_admin' | 'faculty' | 'volunteer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  orgIds: number[];
  organizations?: Organization[];
}

export interface Organization {
  id: number;
  name: string;
  type: 'club' | 'cell' | 'forum' | 'department';
  description?: string;
  logo_path?: string;
  is_active?: boolean;
  event_count?: number;
}

export interface Student {
  id: number;
  roll_number: string;
  barcode: string;
  name: string;
  department?: string;
}

export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

export interface EventSession {
  id: number;
  event_id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  created_by: number;
  creator_name?: string;
  organizations?: Organization[];
  sessions?: EventSession[];
  created_at?: string;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  method: 'barcode' | 'manual';
  marked_at: string;
  roll_number: string;
  name: string;
  department?: string;
  barcode?: string;
  marked_by_name?: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeOrganizations: number;
  attendanceToday: number;
  pendingApprovals: number;
  recentEvents: Event[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
