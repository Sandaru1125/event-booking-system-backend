// src/middleware/validate.js
// Wraps a Zod schema into Express middleware.
// Usage: router.post('/route', validate(mySchema), controller)

const validate = (schema) => (req, res, next) => {
  console.log('🔍 [VALIDATE] Validating request body');
  console.log('  - Keys in body:', Object.keys(req.body));
  console.log('  - Body data:', JSON.stringify(req.body, null, 2).substring(0, 200));
  
  const result = schema.safeParse(req.body);

  if (!result.success) {
    console.error('❌ Validation failed');
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    console.error('  - Errors:', errors);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  console.log('✅ Validation passed');
  console.log('  - Parsed data keys:', Object.keys(result.data));
  req.body = result.data; // use the parsed (and coerced) data
  next();
};

module.exports = validate;
