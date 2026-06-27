const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  authMiddleware(req, res, () => {
    res.json({ username: req.admin.username });
  });
};
