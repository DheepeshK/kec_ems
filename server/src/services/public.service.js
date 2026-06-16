import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function getPublicEvents({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total FROM events WHERE status IN (?, ?)',
    ['approved', 'completed']
  );

  const [rows] = await pool.query(
  `SELECT e.*, u.name as creator_name FROM events e
   LEFT JOIN users u ON e.created_by = u.id
   WHERE e.status IN ('approved', 'completed')
   ORDER BY e.start_date DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  for (const event of rows) {
    const [orgs] = await pool.query(
      `SELECT o.id, o.name, o.type, o.logo_path FROM organizations o
       JOIN event_organizations eo ON o.id = eo.organization_id WHERE eo.event_id = ?`,
      [event.id]
    );
    event.organizations = orgs;
  }

  return { events: rows, total: countRows[0].total, page, limit };
}

export async function getPublicEventById(id) {
  const [rows] = await pool.query(
    `SELECT e.*, u.name as creator_name FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     WHERE e.id = ? AND e.status IN ('approved', 'completed')`,
    [id]
  );
  const event = rows[0];
  if (!event) throw new AppError('Event not found', 404);

  const [orgs] = await pool.query(
    `SELECT o.id, o.name, o.type, o.logo_path, o.description FROM organizations o
     JOIN event_organizations eo ON o.id = eo.organization_id WHERE eo.event_id = ?`,
    [id]
  );
  event.organizations = orgs;

  const [sessions] = await pool.query(
    'SELECT id, name, start_time, end_time FROM event_sessions WHERE event_id = ? ORDER BY start_time',
    [id]
  );
  event.sessions = sessions;

  return event;
}

export async function getPublicOrganizations() {
  const [rows] = await pool.query(
    'SELECT id, name, type, description, logo_path FROM organizations WHERE is_active = TRUE ORDER BY name'
  );

  for (const org of rows) {
    const [eventCount] = await pool.query(
      `SELECT COUNT(DISTINCT e.id) as count FROM events e
       JOIN event_organizations eo ON e.id = eo.event_id
       WHERE eo.organization_id = ? AND e.status IN ('approved', 'completed')`,
      [org.id]
    );
    org.event_count = eventCount[0].count;
  }

  return rows;
}
