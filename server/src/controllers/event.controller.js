import * as eventService from '../services/event.service.js';

export async function list(req, res, next) {
  try {
    const result = await eventService.getEvents(req.user, {
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPending(req, res, next) {
  try {
    const events = await eventService.getPendingEvents(req.user);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const event = await eventService.getEventById(parseInt(req.params.id), req.user);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body, req.user.userId);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const event = await eventService.updateEvent(parseInt(req.params.id), req.body, req.user);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await eventService.deleteEvent(parseInt(req.params.id), req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const event = await eventService.submitEvent(parseInt(req.params.id), req.user);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function approve(req, res, next) {
  try {
    const event = await eventService.approveEvent(parseInt(req.params.id), req.user, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function reject(req, res, next) {
  try {
    const event = await eventService.rejectEvent(parseInt(req.params.id), req.user, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    const event = await eventService.completeEvent(parseInt(req.params.id), req.user);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function createSession(req, res, next) {
  try {
    const session = await eventService.createSession(parseInt(req.params.eventId), req.body, req.user);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function updateSession(req, res, next) {
  try {
    const session = await eventService.updateSession(parseInt(req.params.sessionId), req.body, req.user);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const result = await eventService.deleteSession(parseInt(req.params.sessionId), req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
