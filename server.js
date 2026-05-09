// server.js
// Starts the HTTP server. Keep this file minimal.

require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Test DB connection before accepting traffic
    await prisma.$connect();
    console.log('✅  Connected to PostgreSQL via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`📋  API docs: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌  Failed to connect to database:', err.message);
    console.error('    Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
