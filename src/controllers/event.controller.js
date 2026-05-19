// src/controllers/event.controller.js

const eventService = require('../services/event.service');

const uploadService = require('../services/upload.service');

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
    console.log('📝 [CREATE EVENT] Request received');
    console.log('  - User ID:', req.user?.id);
    console.log('  - User Role:', req.user?.role);
    console.log('  - Has file:', !!req.file);
    console.log('  - File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('  - Body keys:', Object.keys(req.body));
    console.log('  - Body data:', {
      title: req.body.title,
      description: req.body.description?.substring(0, 50) + '...',
      location: req.body.location,
      date: req.body.date,
      time: req.body.time,
      capacity: req.body.capacity,
      price: req.body.price,
      category: req.body.category
    });

    // Validate request body using Zod schema
    const { createEventSchema } = require('../validators/event.validator');
    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
      const err = new Error('Invalid request data');
      err.status = 400;
      err.details = validation.error.format();
      throw err;
    }
    const validatedData = validation.data;

    let imageUrl = null;
    
    // Upload image to ImageKit if provided
    if (req.file) {
      try {
        console.log('🖼️  Uploading image to ImageKit...');
        imageUrl = await uploadService.uploadImage(req.file.buffer, req.file.originalname);
        console.log('✅ Image uploaded:', imageUrl);
      } catch (uploadErr) {
        console.error('❌ Image upload failed:', uploadErr.message);
        // Continue without image
        imageUrl = null;
      }
    } else {
      console.log('⚠️  No image provided');
    }

    // Map capacity to totalSeats if needed
    const data = { ...validatedData };
    if (data.capacity && !data.totalSeats) {
      console.log('🔄 Mapping capacity to totalSeats:', data.capacity);
      data.totalSeats = data.capacity;
      delete data.capacity;
    }

    console.log('💾 Creating event in database...');
    const event = await eventService.createEvent(data, imageUrl);
    console.log('✅ Event created successfully:', event.id);
    res.status(201).json(event);
  } catch (err) {
    console.error('❌ Error creating event:', {
      message: err.message,
      status: err.status,
      stack: err.stack,
      details: err.details || null
    });
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      try {
        console.log('🖼️  Uploading image to ImageKit for update...');
        imageUrl = await uploadService.uploadImage(req.file.buffer, req.file.originalname);
        console.log('✅ Image uploaded:', imageUrl);
      } catch (uploadErr) {
        console.error('❌ Image upload failed during update:', uploadErr.message);
        imageUrl = null;
      }
    }

    const data = { ...req.body };
    if (data.capacity && !data.totalSeats) {
      data.totalSeats = data.capacity;
      delete data.capacity;
    }

    const event = await eventService.updateEvent(req.params.id, data, imageUrl);
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
