// src/controllers/auth.controller.js
// Controllers are thin — they just call the service and send the response.

const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  // req.user is already attached by auth middleware
  res.json({ user: req.user });
};

module.exports = { register, login, refresh, logout, me };
