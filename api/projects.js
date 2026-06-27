const prisma = require('./_lib/prisma');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');
const { parseMultipart, uploadToSupabase } = require('./_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const featured = req.query.featured === 'true';
      const where = featured ? { featured: true } : {};
      const items = await prisma.project.findMany({
        where, orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } },
      });
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { title, desc, longDesc, cat, pos, github, demo, featured, order, imagePosData } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

        const uploadedImages = await Promise.all(
          files.map(async (f, i) => {
            const { filename } = await uploadToSupabase(f.buffer, f.originalname, f.mimetype);
            return { src: filename, pos: parsedPos[i] || '50% 50%', order: i };
          })
        );

        const item = await prisma.project.create({
          data: {
            title, desc, longDesc,
            features: JSON.parse(fields.features || '[]'),
            tags: JSON.parse(fields.tags || '[]'),
            cat, pos: pos || '50% 50%',
            github: github || null, demo: demo || null,
            image: uploadedImages[0]?.src || null,
            featured: featured === 'true',
            order: Number(order) || 0,
            images: { create: uploadedImages },
          },
          include: { images: { orderBy: { order: 'asc' } } },
        });
        return res.status(201).json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
