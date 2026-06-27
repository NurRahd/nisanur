const prisma = require('../../_lib/prisma');
const authMiddleware = require('../../_lib/auth');
const setCors = require('../../_lib/cors');
const { deleteFromSupabase } = require('../../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { title, order } = req.body;
        const group = await prisma.skillGroup.update({
          where: { id },
          data: { title, order },
          include: { skills: { orderBy: { order: 'asc' } } },
        });
        return res.json(group);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const group = await prisma.skillGroup.findUnique({ where: { id }, include: { skills: true } });
        for (const skill of group?.skills || []) {
          if (skill.iconImage) await deleteFromSupabase(skill.iconImage);
        }
        await prisma.skillGroup.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
