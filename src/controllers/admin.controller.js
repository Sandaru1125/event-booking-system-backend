// src/controllers/admin.controller.js

const prisma = require('../config/db');

// ─── Dashboard stats ──────────────────────────────────────────────────────────

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenueResult] = await prisma.$transaction([
      prisma.user.count(),
      prisma.event.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'CONFIRMED' },
      }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
    });

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: revenueResult._sum.totalPrice || 0,
      },
      recentBookings,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Manage users ─────────────────────────────────────────────────────────────

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be USER or ADMIN.' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'User not found.' });
    next(err);
  }
};

module.exports = { getDashboardStats, getAllUsers, changeUserRole };
