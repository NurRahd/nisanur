const ALLOWED = [
  'http://localhost:5173',
  'https://nisanur.vercel.app',
];

module.exports = function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};
