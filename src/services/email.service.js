// src/services/email.service.js
// Sends transactional emails via Nodemailer.
// If EMAIL_USER is not set, emails are skipped silently (useful in dev).

const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = require('../config/env');

const createTransporter = () => {
  if (!EMAIL_USER) return null;

  return nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: Number(EMAIL_PORT) || 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
};

const transporter = createTransporter();

// ─── Booking confirmation ─────────────────────────────────────────────────────

const sendBookingConfirmation = async (booking) => {
  if (!transporter) {
    console.log('ℹ️  Email skipped (EMAIL_USER not configured)');
    return;
  }

  const { user, event, seats, totalPrice, id } = booking;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to: user.email,
    subject: `Booking Confirmed — ${event.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1d4ed8;">Your booking is confirmed! 🎉</h2>
        <p>Hi <strong>${user.name}</strong>, your booking for <strong>${event.title}</strong> is confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #6b7280;">Booking ID</td><td style="padding: 8px; font-weight: bold;">${id}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Event</td><td style="padding: 8px;">${event.title}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Date</td><td style="padding: 8px;">${eventDate}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Location</td><td style="padding: 8px;">${event.location}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Seats</td><td style="padding: 8px;">${seats}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Total Paid</td><td style="padding: 8px; font-weight: bold;">$${totalPrice.toFixed(2)}</td></tr>
        </table>
        <p style="color: #6b7280; font-size: 14px;">See you there!</p>
      </div>
    `,
  });

  console.log(`✉️  Confirmation email sent to ${user.email}`);
};

module.exports = { sendBookingConfirmation };
