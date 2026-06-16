import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export async function login(email, password) {
  const [rows] = await pool.query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
    [email]
  );

  const user = rows[0];
  if (!user || !user.is_active) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const [orgRows] = await pool.query(
    'SELECT organization_id FROM organization_members WHERE user_id = ?',
    [user.id]
  );
  const orgIds = orgRows.map((r) => r.organization_id);

  const token = signToken({
    userId: user.id,
    role: user.role,
    orgIds,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgIds,
    },
  };
}

export async function getMe(userId) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
    [userId]
  );

  const user = rows[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const [orgRows] = await pool.query(
    `SELECT o.id, o.name, o.type, o.logo_path
     FROM organizations o
     JOIN organization_members om ON o.id = om.organization_id
     WHERE om.user_id = ?`,
    [userId]
  );

  return {
    ...user,
    organizations: orgRows,
    orgIds: orgRows.map((o) => o.id),
  };
}
