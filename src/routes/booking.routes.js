// src/routes/booking.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validators/booking.validator');

// All routes require login
router.use(protect);

router.post('/',           validate(createBookingSchema), ctrl.createBooking);
router.get('/me',          ctrl.getMyBookings);
router.get('/:id',         ctrl.getBooking);
router.patch('/:id/cancel', ctrl.cancelBooking);

// Admin only
router.get('/', isAdmin, ctrl.getAllBookings);

module.exports = router;
