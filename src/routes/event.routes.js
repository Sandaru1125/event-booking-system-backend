// src/routes/event.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createEventSchema, updateEventSchema } = require('../validators/event.validator');

// Public
router.get('/',              ctrl.getEvents);
router.get('/categories',    ctrl.getCategories);
router.get('/:id',           ctrl.getEvent);

// Admin only
router.post('/',             protect, isAdmin, upload.single('image'), validate(createEventSchema), ctrl.createEvent);
router.put('/:id',           protect, isAdmin, upload.single('image'), validate(updateEventSchema), ctrl.updateEvent);
router.delete('/:id',        protect, isAdmin, ctrl.deleteEvent);
router.post('/categories',   protect, isAdmin, ctrl.createCategory);

module.exports = router;
