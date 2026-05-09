// src/middleware/validate.js
// Wraps a Zod schema into Express middleware.
// Usage: router.post('/route', validate(mySchema), controller)

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.body = result.data; // use the parsed (and coerced) data
  next();
};

module.exports = validate;
