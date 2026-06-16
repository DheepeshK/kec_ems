import * as orgService from '../services/organization.service.js';

export async function list(req, res, next) {
  try {
    const orgs = await orgService.getOrganizations(req.user);
    res.json({ success: true, data: orgs });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const org = await orgService.getOrganizationById(parseInt(req.params.id), req.user);
    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const org = await orgService.createOrganization(req.body);
    res.status(201).json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const org = await orgService.updateOrganization(parseInt(req.params.id), req.body, req.user);
    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await orgService.deleteOrganization(parseInt(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const logoPath = `/uploads/logos/${req.file.filename}`;
    const org = await orgService.updateOrganizationLogo(parseInt(req.params.id), logoPath);
    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function getEvents(req, res, next) {
  try {
    const events = await orgService.getOrganizationEvents(parseInt(req.params.id));
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}
