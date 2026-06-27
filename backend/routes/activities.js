const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/activities — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.activity.findMany({
      orderBy: { order: 'asc' },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/activities — admin (multipart, images[] field)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, date, description, longDesc, details, tags, order, imagePosData } = req.body;
    const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

    const item = await prisma.activity.create({
      data: {
        title,
        date,
        description,
        longDesc,
        details: JSON.parse(details || '[]'),
        tags: JSON.parse(tags || '[]'),
        order: Number(order) || 0,
        images: {
          create: (req.files || []).map((f, i) => ({
            src: f.filename,
            pos: parsedPos[i] || '50% 50%',
            order: i,
          })),
        },
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/activities/:id — admin
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, date, description, longDesc, details, tags, order, imagePosData, keepImages } = req.body;
    const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];
    const toKeep = keepImages ? JSON.parse(keepImages) : null; // array of image IDs to keep

    const existing = await prisma.activity.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });

    // Delete images not in keepImages
    if (toKeep !== null) {
      const toDelete = existing.images.filter((img) => !toKeep.includes(img.id));
      for (const img of toDelete) {
        const filePath = path.join(__dirname, '../uploads', img.src);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await prisma.activityImage.delete({ where: { id: img.id } });
      }
    }

    // Update order of kept images
    const keptImages = await prisma.activityImage.findMany({
      where: { activityId: Number(req.params.id) },
      orderBy: { order: 'asc' },
    });

    // Add new images
    const newImages = (req.files || []).map((f, i) => ({
      src: f.filename,
      pos: parsedPos[i] || '50% 50%',
      order: keptImages.length + i,
    }));

    const item = await prisma.activity.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        date,
        description,
        longDesc,
        details: details ? JSON.parse(details) : undefined,
        tags: tags ? JSON.parse(tags) : undefined,
        order: order !== undefined ? Number(order) : undefined,
        images: newImages.length > 0 ? { create: newImages } : undefined,
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/activities/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.activity.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });
    for (const img of existing?.images || []) {
      const filePath = path.join(__dirname, '../uploads', img.src);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.activity.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
