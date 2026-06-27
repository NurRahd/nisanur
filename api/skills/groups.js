const prisma = require('../_lib/prisma');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');
const { deleteFromSupabase } = require('../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { title, order } = req.body;
        const group = await prisma.skillGroup.create({ data: { title, order: order ?? 0 } });
        return res.status(201).json(group);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
