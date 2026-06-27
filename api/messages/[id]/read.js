const prisma = require('../../../_lib/prisma');
const authMiddleware = require('../../../_lib/auth');
const setCors = require('../../../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  return authMiddleware(req, res, async () => {
    try {
      const id = Number(req.query.id);
      const msg = await prisma.message.update({ where: { id }, data: { read: true } });
      return res.json(msg);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  });
};
