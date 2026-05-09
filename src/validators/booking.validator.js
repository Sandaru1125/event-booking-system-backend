// src/validators/booking.validator.js

const { z } = require('zod');

const createBookingSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  seats: z.coerce.number().int().positive('Seats must be a positive integer'),
});

module.exports = { createBookingSchema };
