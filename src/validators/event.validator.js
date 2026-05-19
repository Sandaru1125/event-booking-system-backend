// src/validators/event.validator.js

const { z } = require('zod');

const baseEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  time: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  price: z.coerce.number().nonnegative('Price must be 0 or more'),
  totalSeats: z.coerce.number().int().positive('Total seats must be a positive integer').optional(),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  category: z.string().optional(),
});

const createEventSchema = baseEventSchema.refine(data => data.totalSeats || data.capacity, {
  message: "Either totalSeats or capacity must be provided",
  path: ["totalSeats"]
});

const updateEventSchema = baseEventSchema.partial();

module.exports = { createEventSchema, updateEventSchema };
