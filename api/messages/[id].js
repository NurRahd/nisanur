const prisma = require('../_lib/prisma');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        await prisma.message.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
