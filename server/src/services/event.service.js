import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

function canManageEvent(user, event) {
  if (user.role === 'super_admin') return true;
  if (user.role === 'faculty' && event.created_by === user.userId) return true;
  if (user.role === 'club_admin') return true;
  return false;
}

export async function getEvents(user, { status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params = [];

  if (status) {
    where += ' AND e.status = ?';
    params.push(status);
  }

  if (user.role === 'faculty') {
    where += ' AND e.created_by = ?';
    params.push(user.userId);
  } else if (user.role === 'club_admin') {
    where += ' AND eo.organization_id IN (?)';
    params.push(user.orgIds.length ? user.orgIds : [0]);
  }

  const baseQuery = `FROM events e
    LEFT JOIN event_organizations eo ON e.id = eo.event_id
    LEFT JOIN users u ON e.created_by = u.id
    ${where}`;

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT e.id) as total ${baseQuery}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT DISTINCT e.*, u.name as creator_name ${baseQuery}
     ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  for (const event of rows) {
    event.organizations = await getEventOrganizations(event.id);
    event.sessions = await getSessions(event.id);
  }

  return { events: rows, total: countRows[0].total, page, limit };
}

export async function getEventById(id, user = null) {
  const [rows] = await pool.query(
    `SELECT e.*, u.name as creator_name FROM events e
     LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?`,
    [id]
  );
  const event = rows[0];
  if (!event) throw new AppError('Event not found', 404);

  if (user && user.role === 'faculty' && event.created_by !== user.userId) {
    throw new AppError('Insufficient permissions', 403);
  }

  event.organizations = await getEventOrganizations(id);
  event.sessions = await getSessions(id);
  return event;
}

async function getEventOrganizations(eventId) {
  const [rows] = await pool.query(
    `SELECT o.* FROM organizations o
     JOIN event_organizations eo ON o.id = eo.organization_id
     WHERE eo.event_id = ?`,
    [eventId]
  );
  return rows;
}

async function getSessions(eventId) {
  const [rows] = await pool.query(
    'SELECT * FROM event_sessions WHERE event_id = ? ORDER BY start_time',
    [eventId]
  );
  return rows;
}

export async function createEvent(data, userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO events (title, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [data.title, data.description || null, data.start_date, data.end_date, 'draft', userId]
    );
    const eventId = result.insertId;

    if (data.organization_ids?.length) {
      for (const orgId of data.organization_ids) {
        await conn.query(
          'INSERT INTO event_organizations (event_id, organization_id) VALUES (?, ?)',
          [eventId, orgId]
        );
      }
    }

    if (data.sessions?.length) {
      for (const session of data.sessions) {
        await conn.query(
          'INSERT INTO event_sessions (event_id, name, start_time, end_time) VALUES (?, ?, ?, ?)',
          [eventId, session.name, session.start_time, session.end_time]
        );
      }
    }

    await conn.commit();
    return await getEventById(eventId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateEvent(id, data, user) {
  const event = await getEventById(id);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }
  if (event.status === 'completed') {
    throw new AppError('Cannot edit completed events', 400);
  }

  await pool.query(
    'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?',
    [
      data.title ?? event.title,
      data.description ?? event.description,
      data.start_date ?? event.start_date,
      data.end_date ?? event.end_date,
      id,
    ]
  );

  if (data.organization_ids) {
    await pool.query('DELETE FROM event_organizations WHERE event_id = ?', [id]);
    for (const orgId of data.organization_ids) {
      await pool.query(
        'INSERT INTO event_organizations (event_id, organization_id) VALUES (?, ?)',
        [id, orgId]
      );
    }
  }

  return await getEventById(id);
}

export async function deleteEvent(id, user) {
  const event = await getEventById(id);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }
  if (event.status !== 'draft') {
    throw new AppError('Only draft events can be deleted', 400);
  }
  await pool.query('DELETE FROM events WHERE id = ?', [id]);
  return { message: 'Event deleted' };
}

export async function submitEvent(id, user) {
  const event = await getEventById(id);
  if (event.created_by !== user.userId && user.role !== 'super_admin') {
    throw new AppError('Insufficient permissions', 403);
  }
  if (event.status !== 'draft') {
    throw new AppError('Only draft events can be submitted', 400);
  }
  await pool.query('UPDATE events SET status = ? WHERE id = ?', ['pending', id]);
  return await getEventById(id);
}

export async function approveEvent(id, user, { organization_id, comment }) {
  const event = await getEventById(id);
  if (event.status !== 'pending') {
    throw new AppError('Only pending events can be approved', 400);
  }

  if (user.role === 'club_admin') {
    if (!user.orgIds.includes(organization_id)) {
      throw new AppError('Cannot approve for this organization', 403);
    }
  }

  const orgId = organization_id || event.organizations[0]?.id;
  if (!orgId) throw new AppError('No organization linked to event', 400);

  await pool.query(
    'INSERT INTO event_approvals (event_id, approver_id, organization_id, status, comment) VALUES (?, ?, ?, ?, ?)',
    [id, user.userId, orgId, 'approved', comment || null]
  );
  await pool.query('UPDATE events SET status = ? WHERE id = ?', ['approved', id]);
  return await getEventById(id);
}

export async function rejectEvent(id, user, { organization_id, comment }) {
  const event = await getEventById(id);
  if (event.status !== 'pending') {
    throw new AppError('Only pending events can be rejected', 400);
  }

  if (user.role === 'club_admin') {
    if (!user.orgIds.includes(organization_id)) {
      throw new AppError('Cannot reject for this organization', 403);
    }
  }

  const orgId = organization_id || event.organizations[0]?.id;
  await pool.query(
    'INSERT INTO event_approvals (event_id, approver_id, organization_id, status, comment) VALUES (?, ?, ?, ?, ?)',
    [id, user.userId, orgId, 'rejected', comment || null]
  );
  await pool.query('UPDATE events SET status = ? WHERE id = ?', ['rejected', id]);
  return await getEventById(id);
}

export async function completeEvent(id, user) {
  const event = await getEventById(id);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }
  if (event.status !== 'approved') {
    throw new AppError('Only approved events can be completed', 400);
  }
  await pool.query('UPDATE events SET status = ? WHERE id = ?', ['completed', id]);
  return await getEventById(id);
}

export async function getPendingEvents(user) {
  let query = `SELECT DISTINCT e.*, u.name as creator_name
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN event_organizations eo ON e.id = eo.event_id
    WHERE e.status = 'pending'`;
  const params = [];

  if (user.role === 'club_admin') {
    query += ' AND eo.organization_id IN (?)';
    params.push(user.orgIds.length ? user.orgIds : [0]);
  }

  query += ' ORDER BY e.created_at DESC';
  const [rows] = await pool.query(query, params);

  for (const event of rows) {
    event.organizations = await getEventOrganizations(event.id);
  }
  return rows;
}

export async function createSession(eventId, data, user) {
  const event = await getEventById(eventId);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }

  const [result] = await pool.query(
    'INSERT INTO event_sessions (event_id, name, start_time, end_time) VALUES (?, ?, ?, ?)',
    [eventId, data.name, data.start_time, data.end_time]
  );
  const [rows] = await pool.query('SELECT * FROM event_sessions WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateSession(sessionId, data, user) {
  const [sessionRows] = await pool.query('SELECT * FROM event_sessions WHERE id = ?', [sessionId]);
  const session = sessionRows[0];
  if (!session) throw new AppError('Session not found', 404);

  const event = await getEventById(session.event_id);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }

  await pool.query(
    'UPDATE event_sessions SET name = ?, start_time = ?, end_time = ? WHERE id = ?',
    [
      data.name ?? session.name,
      data.start_time ?? session.start_time,
      data.end_time ?? session.end_time,
      sessionId,
    ]
  );
  const [rows] = await pool.query('SELECT * FROM event_sessions WHERE id = ?', [sessionId]);
  return rows[0];
}

export async function deleteSession(sessionId, user) {
  const [sessionRows] = await pool.query('SELECT * FROM event_sessions WHERE id = ?', [sessionId]);
  const session = sessionRows[0];
  if (!session) throw new AppError('Session not found', 404);

  const event = await getEventById(session.event_id);
  if (!canManageEvent(user, event)) {
    throw new AppError('Insufficient permissions', 403);
  }

  await pool.query('DELETE FROM event_sessions WHERE id = ?', [sessionId]);
  return { message: 'Session deleted' };
}

export async function getSessionById(sessionId) {
  const [rows] = await pool.query(
    `SELECT es.*, e.title as event_title, e.status as event_status
     FROM event_sessions es JOIN events e ON es.event_id = e.id WHERE es.id = ?`,
    [sessionId]
  );
  if (!rows[0]) throw new AppError('Session not found', 404);
  return rows[0];
}
