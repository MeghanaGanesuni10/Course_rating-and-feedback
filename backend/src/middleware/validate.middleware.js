/**
 * Validate that required fields are present and non-empty strings.
 * @param {string[]} fields
 */
export const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || String(req.body[f]).trim() === ''
  );
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}.` });
  }
  next();
};
