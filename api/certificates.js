const prisma = require('./_lib/prisma');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');
const { parseMultipart, uploadToSupabase } = require('./_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const items = await prisma.certificate.findMany({ orderBy: { order: 'asc' } });
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { name, issuer, certificateId, issued, expires, file, imagePos, imageFit, imageZoom, order } = fields;
        let image = null;
        if (files.length > 0) {
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          image = filename;
        }
        const item = await prisma.certificate.create({
          data: {
            name, issuer, certificateId, issued, expires,
            file: file || null, image,
            imagePos: imagePos || '50% 50%',
            imageFit: imageFit || 'cover',
            imageZoom: imageZoom ? parseFloat(imageZoom) : 1,
            order: Number(order) || 0,
          },
        });
        return res.status(201).json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
