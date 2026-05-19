// scripts/make-admin.js
// This script promotes a user to ADMIN role

require('dotenv').config();
const prisma = require('../src/config/db');

const makeAdmin = async (userId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });
    console.log('✅ User promoted to ADMIN:', user);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

const userId = process.argv[2];
if (!userId) {
  console.error('❌ Usage: node scripts/make-admin.js <userId>');
  process.exit(1);
}

makeAdmin(userId);
