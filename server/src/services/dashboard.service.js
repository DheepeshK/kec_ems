import pool from '../config/db.js';

export async function getDashboardStats(user) {
  const stats = {
    totalEvents: 0,
    activeOrganizations: 0,
    attendanceToday: 0,
    pendingApprovals: 0,
    recentEvents: [],
  };

  if (user.role === 'super_admin') {
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events');
    stats.totalEvents = eventCount[0].count;

    const [orgCount] = await pool.query('SELECT COUNT(*) as count FROM organizations WHERE is_active = TRUE');
    stats.activeOrganizations = orgCount[0].count;

    const [pending] = await pool.query('SELECT COUNT(*) as count FROM events WHERE status = ?', ['pending']);
    stats.pendingApprovals = pending[0].count;
  } else if (user.role === 'club_admin') {
    const orgIds = user.orgIds.length ? user.orgIds : [0];
    const [eventCount] = await pool.query(
      `SELECT COUNT(DISTINCT e.id) as count FROM events e
       JOIN event_organizations eo ON e.id = eo.event_id WHERE eo.organization_id IN (?)`,
      [orgIds]
    );
    stats.totalEvents = eventCount[0].count;

    const [orgCount] = await pool.query('SELECT COUNT(*) as count FROM organizations WHERE id IN (?) AND is_active = TRUE', [orgIds]);
    stats.activeOrganizations = orgCount[0].count;

    const [pending] = await pool.query(
      `SELECT COUNT(DISTINCT e.id) as count FROM events e
       JOIN event_organizations eo ON e.id = eo.event_id
       WHERE e.status = 'pending' AND eo.organization_id IN (?)`,
      [orgIds]
    );
    stats.pendingApprovals = pending[0].count;
  } else if (user.role === 'faculty') {
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events WHERE created_by = ?', [user.userId]);
    stats.totalEvents = eventCount[0].count;
  }

  const [attendanceToday] = await pool.query(
    'SELECT COUNT(*) as count FROM attendance WHERE DATE(marked_at) = CURDATE()'
  );
  stats.attendanceToday = attendanceToday[0].count;

  let recentQuery = `SELECT e.*, u.name as creator_name FROM events e
    LEFT JOIN users u ON e.created_by = u.id`;
  const recentParams = [];

  if (user.role === 'faculty') {
    recentQuery += ' WHERE e.created_by = ?';
    recentParams.push(user.userId);
  } else if (user.role === 'club_admin') {
    recentQuery += ` WHERE e.id IN (
      SELECT event_id FROM event_organizations WHERE organization_id IN (?)
    )`;
    recentParams.push(user.orgIds.length ? user.orgIds : [0]);
  }

  recentQuery += ' ORDER BY e.created_at DESC LIMIT 5';
  const [recent] = await pool.query(recentQuery, recentParams);
  stats.recentEvents = recent;

  return stats;
}
