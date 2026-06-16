import * as publicService from '../services/public.service.js';

export async function getEvents(req, res, next) {
  try {
    const result = await publicService.getPublicEvents({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await publicService.getPublicEventById(parseInt(req.params.id));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function getOrganizations(req, res, next) {
  try {
    const orgs = await publicService.getPublicOrganizations();
    res.json({ success: true, data: orgs });
  } catch (err) {
    next(err);
  }
}
