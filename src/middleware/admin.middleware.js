// src/middleware/admin.middleware.js
// Must be used AFTER protect middleware (needs req.user to exist).
// Blocks the request if the user is not an ADMIN.

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { isAdmin };
