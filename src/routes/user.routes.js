// src/routes/user.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile',    ctrl.getProfile);
router.put('/profile',    ctrl.updateProfile);

module.exports = router;
