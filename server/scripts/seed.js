import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

const SEED_USERS = [
  { name: 'Super Admin', email: 'admin@kec.edu', role: 'super_admin' },
  { name: 'Club Admin', email: 'clubadmin@kec.edu', role: 'club_admin' },
  { name: 'Faculty User', email: 'faculty@kec.edu', role: 'faculty' },
  { name: 'Volunteer User', email: 'volunteer@kec.edu', role: 'volunteer' },
];

const ORGANIZATIONS = [
  { name: 'Computer Science Club', type: 'club', description: 'Official computer science club of KEC' },
  { name: 'Innovation Cell', type: 'cell', description: 'Promoting innovation and entrepreneurship' },
  { name: 'CSE Department', type: 'department', description: 'Department of Computer Science and Engineering' },
];

const STUDENTS = [
  { roll_number: '21CS001', barcode: 'BC21001', name: 'John Doe', department: 'CSE' },
  { roll_number: '21CS002', barcode: 'BC21002', name: 'Jane Smith', department: 'CSE' },
  { roll_number: '21CS003', barcode: 'BC21003', name: 'Alice Johnson', department: 'CSE' },
  { roll_number: '21ME001', barcode: 'BC21004', name: 'Bob Wilson', department: 'ME' },
  { roll_number: '21EE001', barcode: 'BC21005', name: 'Carol Davis', department: 'EE' },
];

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 12);
  console.log('Seeding database...');

  for (const user of SEED_USERS) {
    await pool.query(
      'INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, passwordHash, user.role]
    );
  }

  for (const org of ORGANIZATIONS) {
    await pool.query(
      'INSERT IGNORE INTO organizations (name, type, description) VALUES (?, ?, ?)',
      [org.name, org.type, org.description]
    );
  }

  await pool.query('INSERT IGNORE INTO organization_members (user_id, organization_id) VALUES (2, 1)');
  await pool.query('INSERT IGNORE INTO organization_members (user_id, organization_id) VALUES (3, 1)');
  await pool.query('INSERT IGNORE INTO organization_members (user_id, organization_id) VALUES (4, 1)');

  for (const student of STUDENTS) {
    await pool.query(
      'INSERT IGNORE INTO students (roll_number, barcode, name, department) VALUES (?, ?, ?, ?)',
      [student.roll_number, student.barcode, student.name, student.department]
    );
  }

  console.log('Seed completed. Default password for all users: password123');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
