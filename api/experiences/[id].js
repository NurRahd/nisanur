const prisma = require('../_lib/prisma');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');
const { parseMultipart, uploadToSupabase, deleteFromSupabase } = require('../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { period, duration, title, institution, bullets, skills, order } = fields;
        const existing = await prisma.experience.findUnique({ where: { id } });
        let logoImage = existing?.logoImage;
        if (files.length > 0) {
          if (existing?.logoImage) await deleteFromSupabase(existing.logoImage);
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          logoImage = filename;
        }
        const item = await prisma.experience.update({
          where: { id },
          data: {
            period, duration, title, institution,
            bullets: bullets ? JSON.parse(bullets) : undefined,
            skills: skills ? JSON.parse(skills) : undefined,
            logoImage,
            order: order !== undefined ? Number(order) : undefined,
          },
        });
        return res.json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const existing = await prisma.experience.findUnique({ where: { id } });
        if (existing?.logoImage) await deleteFromSupabase(existing.logoImage);
        await prisma.experience.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
