// src/services/booking.service.js
// The createBooking function uses a Prisma transaction so seat decrement
// and booking creation happen atomically — no double-booking possible.

const prisma = require('../config/db');
const emailService = require('./email.service');

// ─── Create booking ───────────────────────────────────────────────────────────

const createBooking = async ({ userId, eventId, seats }) => {
  return prisma.$transaction(async (tx) => {
    // Lock the event row to prevent race conditions
    const event = await tx.event.findUnique({ where: { id: eventId } });

    if (!event) {
      const err = new Error('Event not found.');
      err.status = 404;
      throw err;
    }

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      const err = new Error(`Cannot book a ${event.status.toLowerCase()} event.`);
      err.status = 400;
      throw err;
    }

    const available = event.totalSeats - event.bookedSeats;
    if (seats > available) {
      const err = new Error(`Only ${available} seat(s) left.`);
      err.status = 400;
      throw err;
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        seats,
        totalPrice: seats * event.price,
        status: 'CONFIRMED',
      },
      include: {
        event: { include: { category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.event.update({
      where: { id: eventId },
      data: { bookedSeats: { increment: seats } },
    });

    // Send confirmation email (non-blocking — don't fail booking if email fails)
    emailService.sendBookingConfirmation(booking).catch((err) =>
      console.error('Email send failed:', err.message)
    );

    return booking;
  });
};

// ─── Get user bookings ────────────────────────────────────────────────────────

const getUserBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { include: { category: true } },
    },
  });
};

// ─── Get single booking ───────────────────────────────────────────────────────

const getBookingById = async (id, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      event: { include: { category: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!booking) {
    const err = new Error('Booking not found.');
    err.status = 404;
    throw err;
  }

  // Regular users can only see their own bookings
  if (booking.userId !== userId) {
    const err = new Error('Access denied.');
    err.status = 403;
    throw err;
  }

  return booking;
};

// ─── Cancel booking ───────────────────────────────────────────────────────────

const cancelBooking = async (id, userId) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });

    if (!booking) {
      const err = new Error('Booking not found.');
      err.status = 404;
      throw err;
    }

    if (booking.userId !== userId) {
      const err = new Error('Access denied.');
      err.status = 403;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled.');
      err.status = 400;
      throw err;
    }

    const updated = await tx.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Free up the seats
    await tx.event.update({
      where: { id: booking.eventId },
      data: { bookedSeats: { decrement: booking.seats } },
    });

    return updated;
  });
};

// ─── Admin: get all bookings ──────────────────────────────────────────────────

const getAllBookings = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true } },
      },
    }),
    prisma.booking.count(),
  ]);

  return {
    bookings,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings };
