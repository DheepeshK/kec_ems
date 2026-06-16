import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import fs from 'fs';
import csv from 'csv-parser';

export async function getStudents({ page = 1, limit = 20, search = '' }) {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];

  if (search) {
    where = 'WHERE roll_number LIKE ? OR name LIKE ? OR barcode LIKE ? OR department LIKE ?';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM students ${where}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT * FROM students ${where} ORDER BY roll_number LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { students: rows, total, page, limit };
}

export async function getStudentById(id) {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
  if (!rows[0]) throw new AppError('Student not found', 404);
  return rows[0];
}

export async function getStudentByBarcode(barcode) {
  const [rows] = await pool.query('SELECT * FROM students WHERE barcode = ?', [barcode]);
  if (!rows[0]) throw new AppError('Student not found with this barcode', 404);
  return rows[0];
}

export async function getStudentByRoll(rollNumber) {
  const [rows] = await pool.query('SELECT * FROM students WHERE roll_number = ?', [rollNumber]);
  if (!rows[0]) throw new AppError('Student not found with this roll number', 404);
  return rows[0];
}

export async function createStudent(data) {
  try {
    const [result] = await pool.query(
      'INSERT INTO students (roll_number, barcode, name, department) VALUES (?, ?, ?, ?)',
      [data.roll_number, data.barcode, data.name, data.department || null]
    );
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Roll number or barcode already exists', 409);
    }
    throw err;
  }
}

export async function updateStudent(id, data) {
  await getStudentById(id);
  try {
    await pool.query(
      'UPDATE students SET roll_number = ?, barcode = ?, name = ?, department = ? WHERE id = ?',
      [data.roll_number, data.barcode, data.name, data.department || null, id]
    );
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Roll number or barcode already exists', 409);
    }
    throw err;
  }
}

export async function deleteStudent(id) {
  await getStudentById(id);
  await pool.query('DELETE FROM students WHERE id = ?', [id]);
  return { message: 'Student deleted' };
}

export async function importStudentsFromCsv(filePath) {
  const rows = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  for await (const row of stream) {
    rows.push({
      roll_number: (row.roll_number || row.rollNumber || '').trim(),
      barcode: (row.barcode || '').trim(),
      name: (row.name || '').trim(),
      department: (row.department || '').trim(),
    });
  }

  let inserted = 0;
  let skipped = 0;
  const errors = [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const line = i + 2;

      if (!row.roll_number || !row.barcode || !row.name) {
        errors.push({ line, message: 'Missing required fields (roll_number, barcode, name)' });
        skipped++;
        continue;
      }

      try {
        await conn.query(
          'INSERT INTO students (roll_number, barcode, name, department) VALUES (?, ?, ?, ?)',
          [row.roll_number, row.barcode, row.name, row.department || null]
        );
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          errors.push({ line, message: `Duplicate roll_number or barcode: ${row.roll_number}` });
          skipped++;
        } else {
          errors.push({ line, message: err.message });
          skipped++;
        }
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    fs.unlink(filePath, () => {});
  }

  return { inserted, skipped, errors, total: rows.length };
}
