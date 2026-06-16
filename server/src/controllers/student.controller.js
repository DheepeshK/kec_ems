import * as studentService from '../services/student.service.js';

export async function list(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await studentService.getStudents({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const student = await studentService.getStudentById(parseInt(req.params.id));
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function getByBarcode(req, res, next) {
  try {
    const student = await studentService.getStudentByBarcode(req.params.code);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function getByRoll(req, res, next) {
  try {
    const student = await studentService.getStudentByRoll(req.params.roll);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const student = await studentService.updateStudent(parseInt(req.params.id), req.body);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await studentService.deleteStudent(parseInt(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function importCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }
    const result = await studentService.importStudentsFromCsv(req.file.path);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
