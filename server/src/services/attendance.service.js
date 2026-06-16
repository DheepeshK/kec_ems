import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import * as studentService from './student.service.js';
import * as eventService from './event.service.js';

export async function markAttendance(sessionId, studentId, method, markedBy) {
  const session = await eventService.getSessionById(sessionId);
  if (session.event_status !== 'approved' && session.event_status !== 'completed') {
    throw new AppError('Attendance only allowed for approved or completed events', 400);
  }

  const [existing] = await pool.query(
    'SELECT id FROM attendance WHERE session_id = ? AND student_id = ?',
    [sessionId, studentId]
  );

  if (existing.length > 0) {
    throw new AppError('Student already marked present for this session', 409);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO attendance (session_id, student_id, method, marked_by) VALUES (?, ?, ?, ?)',
      [sessionId, studentId, method, markedBy]
    );

    const [rows] = await pool.query(
      `SELECT a.*, s.roll_number, s.name, s.department, u.name as marked_by_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON a.marked_by = u.id
       WHERE a.id = ?`,
      [result.insertId]
    );
    return rows[0];
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Student already marked present for this session', 409);
    }
    throw err;
  }
}

export async function markByBarcode(sessionId, barcode, markedBy) {
  const student = await studentService.getStudentByBarcode(barcode);
  return await markAttendance(sessionId, student.id, 'barcode', markedBy);
}

export async function markByRoll(sessionId, rollNumber, markedBy) {
  const student = await studentService.getStudentByRoll(rollNumber);
  return await markAttendance(sessionId, student.id, 'manual', markedBy);
}

export async function getAttendance(sessionId) {
  const [rows] = await pool.query(
    `SELECT a.*, s.roll_number, s.name, s.department, s.barcode, u.name as marked_by_name
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     JOIN users u ON a.marked_by = u.id
     WHERE a.session_id = ?
     ORDER BY a.marked_at DESC`,
    [sessionId]
  );
  return { attendance: rows, count: rows.length };
}

export async function removeAttendance(sessionId, attendanceId, user) {
  const [rows] = await pool.query(
    'SELECT * FROM attendance WHERE id = ? AND session_id = ?',
    [attendanceId, sessionId]
  );
  if (!rows[0]) throw new AppError('Attendance record not found', 404);

  const allowedRoles = ['super_admin', 'club_admin', 'faculty'];
  if (!allowedRoles.includes(user.role)) {
    throw new AppError('Insufficient permissions', 403);
  }

  await pool.query('DELETE FROM attendance WHERE id = ?', [attendanceId]);
  return { message: 'Attendance record removed' };
}
