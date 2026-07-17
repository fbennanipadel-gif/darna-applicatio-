export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  // Zod validation errors → 400 with a readable field summary.
  if (err.name === 'ZodError') {
    const detail = (err.issues || err.errors || [])
      .map((i) => `${(i.path || []).join('.')}: ${i.message}`)
      .join(' · ');
    return res.status(400).json({ message: detail || 'Invalid request data' });
  }
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists' });
  res.status(err.statusCode || 500).json({ message: err.message || 'Unexpected server error' });
}
