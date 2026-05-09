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

  return {
    events,
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

  return event;
};

// ─── Create event ─────────────────────────────────────────────────────────────

const createEvent = async (data, imageUrl) => {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    const err = new Error('Category not found.');
    err.status = 404;
    throw err;
  }

  return prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date),
      imageUrl: imageUrl || null,
    },
    include: { category: true },
  });
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
  if (data.date) updateData.date = new Date(data.date);
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
