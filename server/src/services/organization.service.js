import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function getOrganizations(user) {
  let query = 'SELECT * FROM organizations WHERE is_active = TRUE';
  const params = [];

  if (user.role === 'club_admin') {
    query += ' AND id IN (?)';
    params.push(user.orgIds.length ? user.orgIds : [0]);
  }

  query += ' ORDER BY name';
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function getOrganizationById(id, user) {
  const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
  const org = rows[0];
  if (!org) throw new AppError('Organization not found', 404);

  if (user.role === 'club_admin' && !user.orgIds.includes(org.id)) {
    throw new AppError('Insufficient permissions', 403);
  }

  return org;
}

export async function createOrganization(data) {
  const [result] = await pool.query(
    'INSERT INTO organizations (name, type, description) VALUES (?, ?, ?)',
    [data.name, data.type, data.description || null]
  );
  const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateOrganization(id, data, user) {
  const org = await getOrganizationById(id, user);
  await pool.query(
    'UPDATE organizations SET name = ?, type = ?, description = ? WHERE id = ?',
    [
      data.name ?? org.name,
      data.type ?? org.type,
      data.description ?? org.description,
      id,
    ]
  );
  const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
  return rows[0];
}

export async function deleteOrganization(id) {
  const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
  if (!rows[0]) throw new AppError('Organization not found', 404);
  await pool.query('UPDATE organizations SET is_active = FALSE WHERE id = ?', [id]);
  return { message: 'Organization deactivated' };
}

export async function updateOrganizationLogo(id, logoPath) {
  await pool.query('UPDATE organizations SET logo_path = ? WHERE id = ?', [logoPath, id]);
  const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
  return rows[0];
}

export async function getOrganizationEvents(id) {
  const [rows] = await pool.query(
    `SELECT e.* FROM events e
     JOIN event_organizations eo ON e.id = eo.event_id
     WHERE eo.organization_id = ?
     ORDER BY e.start_date DESC`,
    [id]
  );
  return rows;
}
