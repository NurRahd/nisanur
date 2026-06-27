const prisma = require('../../_lib/prisma');
const authMiddleware = require('../../_lib/auth');
const setCors = require('../../_lib/cors');
const { parseMultipart, uploadToSupabase, deleteFromSupabase } = require('../../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { name, iconType, iconName, order } = fields;
        const existing = await prisma.skill.findUnique({ where: { id } });

        let iconImage = existing?.iconImage;

        if (files.length > 0 && iconType === 'image') {
          if (existing?.iconImage) await deleteFromSupabase(existing.iconImage);
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          iconImage = filename;
        } else if (iconType === 'lucide' && existing?.iconImage) {
          await deleteFromSupabase(existing.iconImage);
          iconImage = null;
        }

        const skill = await prisma.skill.update({
          where: { id },
          data: {
            name,
            iconType: iconType || 'lucide',
            iconName: iconType === 'lucide' ? (iconName || null) : null,
            iconImage: iconType === 'image' ? iconImage : null,
            order: order !== undefined ? Number(order) : undefined,
          },
        });
        return res.json(skill);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const existing = await prisma.skill.findUnique({ where: { id } });
        if (existing?.iconImage) await deleteFromSupabase(existing.iconImage);
        await prisma.skill.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
