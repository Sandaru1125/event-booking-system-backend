// src/config/db.js
// Creates a single PrismaClient instance used across the whole app.
// In development, hot-reload would create multiple connections without this pattern.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

module.exports = prisma;
