// src/controllers/event.controller.js

const eventService = require('../services/event.service');

const getEvents = async (req, res, next) => {
  try {
    const result = await eventService.getEvents(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    // If an image was uploaded, req.file.buffer is available for Cloudinary
    // For now we store null; wire up Cloudinary upload here when ready
    const imageUrl = null;
    const event = await eventService.createEvent(req.body, imageUrl);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const imageUrl = null;
    const event = await eventService.updateEvent(req.params.id, req.body, imageUrl);
    res.json(event);
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await eventService.getCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await eventService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getCategories, createCategory };
