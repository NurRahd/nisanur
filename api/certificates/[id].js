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
        const { name, issuer, certificateId, issued, expires, file, imagePos, imageFit, imageZoom, order } = fields;
        const existing = await prisma.certificate.findUnique({ where: { id } });
        let image = existing?.image;
        if (files.length > 0) {
          if (existing?.image) await deleteFromSupabase(existing.image);
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          image = filename;
        }
        const item = await prisma.certificate.update({
          where: { id },
          data: {
            name, issuer, certificateId, issued, expires,
            file: file || null, image,
            imagePos: imagePos || existing?.imagePos,
            imageFit: imageFit || existing?.imageFit,
            imageZoom: imageZoom ? parseFloat(imageZoom) : existing?.imageZoom,
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
        const existing = await prisma.certificate.findUnique({ where: { id } });
        if (existing?.image) await deleteFromSupabase(existing.image);
        await prisma.certificate.delete({ where: { id } });
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
