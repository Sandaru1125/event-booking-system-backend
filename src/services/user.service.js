// src/services/user.service.js

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  return user;
};

const updateProfile = async (userId, { name, email, currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const updateData = {};

  if (name) updateData.name = name;

  if (email && email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) {
      const err = new Error('Email already in use.');
      err.status = 409;
      throw err;
    }
    updateData.email = email;
  }

  if (newPassword) {
    if (!currentPassword) {
      const err = new Error('Current password is required to set a new password.');
      err.status = 400;
      throw err;
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      const err = new Error('Current password is incorrect.');
      err.status = 401;
      throw err;
    }
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
};

module.exports = { getProfile, updateProfile };
