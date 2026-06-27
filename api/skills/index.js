const prisma = require('../_lib/prisma');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');
const { parseMultipart, uploadToSupabase, deleteFromSupabase } = require('../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/skills — public
  if (req.method === 'GET') {
    try {
      const groups = await prisma.skillGroup.findMany({
        orderBy: { order: 'asc' },
        include: { skills: { orderBy: { order: 'asc' } } },
      });
      return res.json(groups);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  // POST /api/skills — add skill
  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { name, iconType, iconName, order, skillGroupId } = fields;
        let iconImage = null;

        if (iconType === 'image' && files.length > 0) {
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          iconImage = filename;
        }

        const skill = await prisma.skill.create({
          data: {
            name,
            iconType: iconType || 'lucide',
            iconName: iconName || null,
            iconImage,
            order: Number(order) || 0,
            skillGroupId: Number(skillGroupId),
          },
        });
        return res.status(201).json(skill);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
