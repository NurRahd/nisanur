const prisma = require('./_lib/prisma');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');
const { parseMultipart, uploadToSupabase } = require('./_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const items = await prisma.activity.findMany({
        orderBy: { order: 'asc' },
        include: { images: { orderBy: { order: 'asc' } } },
      });
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { title, date, description, longDesc, details, tags, order, imagePosData } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

        const uploadedImages = await Promise.all(
          files.map(async (f, i) => {
            const { filename } = await uploadToSupabase(f.buffer, f.originalname, f.mimetype);
            return { src: filename, pos: parsedPos[i] || '50% 50%', order: i };
          })
        );

        const item = await prisma.activity.create({
          data: {
            title, date, description, longDesc,
            details: JSON.parse(details || '[]'),
            tags: JSON.parse(tags || '[]'),
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
