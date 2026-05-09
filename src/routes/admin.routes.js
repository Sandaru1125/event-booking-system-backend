// src/routes/admin.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const bookingCtrl = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

// All admin routes require login + ADMIN role
router.use(protect, isAdmin);

router.get('/dashboard',       ctrl.getDashboardStats);
router.get('/users',           ctrl.getAllUsers);
router.patch('/users/:id/role', ctrl.changeUserRole);
router.get('/bookings',        bookingCtrl.getAllBookings);

module.exports = router;
