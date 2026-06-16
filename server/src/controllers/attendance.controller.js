import * as attendanceService from '../services/attendance.service.js';

export async function scan(req, res, next) {
  try {
    const record = await attendanceService.markByBarcode(
      parseInt(req.params.sessionId),
      req.body.barcode,
      req.user.userId
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function manual(req, res, next) {
  try {
    const record = await attendanceService.markByRoll(
      parseInt(req.params.sessionId),
      req.body.roll_number,
      req.user.userId
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const result = await attendanceService.getAttendance(parseInt(req.params.sessionId));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await attendanceService.removeAttendance(
      parseInt(req.params.sessionId),
      parseInt(req.params.id),
      req.user
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
