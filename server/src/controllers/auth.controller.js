import * as authService from '../services/auth.service.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
