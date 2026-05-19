// src/services/event.service.js

const prisma = require('../config/db');

// ─── Get all events (with filters & pagination) ───────────────────────────────

const getEvents = async ({ page = 1, limit = 10, category, status, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (category) where.category = { name: { equals: category, mode: 'insensitive' } };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { date: 'asc' },
      include: { category: true },
    }),
    prisma.event.count({ where }),
  ]);

  const transformedEvents = events.map(event => ({
    ...event,
    image: event.imageUrl,
    capacity: event.totalSeats,
    category: event.category?.name
  }));

  return {
    events: transformedEvents,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── Get single event ─────────────────────────────────────────────────────────

const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  const eventData = {
    ...event,
    image: event.imageUrl,
    capacity: event.totalSeats,
    categoryName: event.category?.name,
    category: event.category?.name, // Also set category for EditEvent.jsx line 39
  };

  if (event.date) {
    const d = new Date(event.date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    eventData.time = `${hours}:${minutes}`;
  }

  return eventData;
};

// ─── Create event ─────────────────────────────────────────────────────────────

const createEvent = async (data, imageUrl) => {
  console.log('🔍 [EVENT SERVICE] createEvent called');
  console.log('  - Data keys:', Object.keys(data));
  console.log('  - Image URL:', imageUrl ? 'Yes' : 'No');
  
  let categoryId = data.categoryId;

  // If categoryId is not provided, try to find or create category by name
  if (!categoryId && data.category) {
    const categoryName = data.category.trim();
    console.log('🏷️  Looking up category:', categoryName);
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      console.log('📝 Category not found, creating new one...');
      category = await prisma.category.create({ data: { name: categoryName } });
      console.log('✅ Category created:', category.id);
    } else {
      console.log('✅ Category found:', category.id);
    }
    categoryId = category.id;
  }

  if (!categoryId) {
    console.error('❌ No category ID available');
    const err = new Error('Category is required.');
    err.status = 400;
    throw err;
  }

  // Handle date and time merging
  let eventDate = new Date(data.date);
  if (data.time) {
    const [hours, minutes] = data.time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes));
    console.log('📅 Date set to:', eventDate.toISOString());
  }

  // Clean up data for Prisma
  const { category: catName, time, ...prismaData } = data;
  
  console.log('💾 Preparing event data for DB:');
  console.log('  - Title:', prismaData.title);
  console.log('  - Price:', prismaData.price);
  console.log('  - Total Seats:', prismaData.totalSeats);
  console.log('  - Category ID:', categoryId);
  
  const result = await prisma.event.create({
    data: {
      ...prismaData,
      categoryId,
      date: eventDate,
      imageUrl: imageUrl || null,
    },
    include: { category: true },
  });
  
  console.log('✅ Event created in database:', result.id);
  return result;
};

// ─── Update event ─────────────────────────────────────────────────────────────

const updateEvent = async (id, data, imageUrl) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  const updateData = { ...data };
  
  if (data.category) {
    const categoryName = data.category.trim();
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName } });
    }
    updateData.categoryId = category.id;
    delete updateData.category;
  }

  if (data.date || data.time) {
    const baseDate = data.date ? new Date(data.date) : new Date(existing.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':');
      baseDate.setHours(parseInt(hours), parseInt(minutes));
    }
    updateData.date = baseDate;
    delete updateData.time;
  }

  if (imageUrl) updateData.imageUrl = imageUrl;

  return prisma.event.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });
};

// ─── Delete event ─────────────────────────────────────────────────────────────

const deleteEvent = async (id) => {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  await prisma.event.delete({ where: { id } });
};

// ─── Get all categories ───────────────────────────────────────────────────────

const getCategories = async () => prisma.category.findMany({ orderBy: { name: 'asc' } });

const createCategory = async (name) => {
  const exists = await prisma.category.findUnique({ where: { name } });
  if (exists) {
    const err = new Error('Category already exists.');
    err.status = 409;
    throw err;
  }
  return prisma.category.create({ data: { name } });
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getCategories, createCategory };
