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
        const { title, desc, longDesc, cat, pos, github, demo, featured, order, imagePosData, keepImages } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];
        const toKeep = keepImages ? JSON.parse(keepImages) : null;

        const existing = await prisma.project.findUnique({ where: { id }, include: { images: true } });

        if (toKeep !== null) {
          const toDelete = existing.images.filter((img) => !toKeep.includes(img.id));
          for (const img of toDelete) {
            await deleteFromSupabase(img.src);
            await prisma.projectImage.delete({ where: { id: img.id } });
          }
        }

        const remainingImages = await prisma.projectImage.findMany({ where: { projectId: id }, orderBy: { order: 'asc' } });

        const newImages = await Promise.all(
          files.map(async (f, i) => {
            const { filename } = await uploadToSupabase(f.buffer, f.originalname, f.mimetype);
            return { src: filename, pos: parsedPos[i] || '50% 50%', order: remainingImages.length + i };
          })
        );

        const allImages = [...remainingImages, ...newImages];
        const thumbnail = allImages[0]?.src || existing?.image || null;

        const item = await prisma.project.update({
          where: { id },
          data: {
            title, desc, longDesc,
            features: fields.features ? JSON.parse(fields.features) : undefined,
            tags: fields.tags ? JSON.parse(fields.tags) : undefined,
            cat,
            pos: pos || existing?.pos,
            github: github !== undefined ? (github || null) : undefined,
            demo: demo !== undefined ? (demo || null) : undefined,
            image: thumbnail,
            featured: featured !== undefined ? featured === 'true' : undefined,
            order: order !== undefined ? Number(order) : undefined,
            images: newImages.length > 0 ? { create: newImages } : undefined,
          },
          include: { images: { orderBy: { order: 'asc' } } },
        });
        return res.json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const existing = await prisma.project.findUnique({ where: { id }, include: { images: true } });
        for (const img of existing?.images || []) await deleteFromSupabase(img.src);
        await prisma.project.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
