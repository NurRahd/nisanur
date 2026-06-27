const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/certificates — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.certificate.findMany({ orderBy: { order: 'asc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/certificates — admin
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, issuer, certificateId, issued, expires, file, imagePos, imageFit, imageZoom, order } = req.body;
    const item = await prisma.certificate.create({
      data: {
        name,
        issuer,
        certificateId,
        issued,
        expires,
        file: file || null,
        image: req.file ? req.file.filename : null,
        imagePos: imagePos || '50% 50%',
        imageFit: imageFit || 'cover',
        imageZoom: imageZoom ? parseFloat(imageZoom) : 1,
        order: Number(order) || 0,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/certificates/:id — admin
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, issuer, certificateId, issued, expires, file, imagePos, imageFit, imageZoom, order } = req.body;
    const existing = await prisma.certificate.findUnique({ where: { id: Number(req.params.id) } });

    if (req.file && existing?.image) {
      const oldPath = path.join(__dirname, '../uploads', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const item = await prisma.certificate.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        issuer,
        certificateId,
        issued,
        expires,
        file: file || null,
        image: req.file ? req.file.filename : existing?.image,
        imagePos: imagePos || existing?.imagePos,
        imageFit: imageFit || existing?.imageFit,
        imageZoom: imageZoom ? parseFloat(imageZoom) : existing?.imageZoom,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/certificates/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.certificate.findUnique({ where: { id: Number(req.params.id) } });
    if (existing?.image) {
      const filePath = path.join(__dirname, '../uploads', existing.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.certificate.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
