const prisma = require('./_lib/prisma');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const items = await prisma.profile.findMany();
      const profile = {};
      for (const item of items) profile[item.key] = item.value;
      return res.json(profile);
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
          await prisma.profile.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          });
        }
        const items = await prisma.profile.findMany();
        const profile = {};
        for (const item of items) profile[item.key] = item.value;
        return res.json(profile);
      } catch (err) {
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
