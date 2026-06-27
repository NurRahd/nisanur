const setCors = require('./_lib/cors');

module.exports = (req, res) => {
  setCors(req, res);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
