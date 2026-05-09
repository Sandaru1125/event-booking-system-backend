// src/routes/auth.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

// Public
router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login',    validate(loginSchema),    ctrl.login);
router.post('/refresh',  validate(refreshSchema),  ctrl.refresh);

// Protected
router.post('/logout', protect, ctrl.logout);
router.get('/me',      protect, ctrl.me);

module.exports = router;
