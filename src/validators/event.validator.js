// src/validators/event.validator.js

const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  location: z.string().min(3, 'Location is required'),
  price: z.coerce.number().nonnegative('Price must be 0 or more'),
  totalSeats: z.coerce.number().int().positive('Total seats must be a positive integer'),
  categoryId: z.string().uuid('Invalid category ID'),
});

const updateEventSchema = createEventSchema.partial();

module.exports = { createEventSchema, updateEventSchema };
