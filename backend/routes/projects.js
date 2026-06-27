const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/projects — public
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const where = featured === 'true' ? { featured: true } : {};
    const items = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects — admin (multiple images)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, desc, longDesc, features, tags, cat, pos, github, demo, featured, order, imagePosData } = req.body;
    const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

    const item = await prisma.project.create({
      data: {
        title,
        desc,
        longDesc,
        features: JSON.parse(features || '[]'),
        tags: JSON.parse(tags || '[]'),
        cat,
        pos: pos || '50% 50%',
        github: github || null,
        demo: demo || null,
        image: req.files?.[0]?.filename || null, // thumbnail = first image
        featured: featured === 'true',
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

// PUT /api/projects/:id — admin
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, desc, longDesc, features, tags, cat, pos, github, demo, featured, order, imagePosData, keepImages } = req.body;
    const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];
    const toKeep = keepImages ? JSON.parse(keepImages) : null;

    const existing = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });

    // Delete images not in keepImages
    if (toKeep !== null) {
      const toDelete = existing.images.filter((img) => !toKeep.includes(img.id));
      for (const img of toDelete) {
        const filePath = path.join(__dirname, '../uploads', img.src);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await prisma.projectImage.delete({ where: { id: img.id } });
      }
    }

    // Get remaining images after deletion
    const remainingImages = await prisma.projectImage.findMany({
      where: { projectId: Number(req.params.id) },
      orderBy: { order: 'asc' },
    });

    // Add new images
    const newImages = (req.files || []).map((f, i) => ({
      src: f.filename,
      pos: parsedPos[i] || '50% 50%',
      order: remainingImages.length + i,
    }));

    // thumbnail = first remaining image or first new image
    const allImages = [...remainingImages, ...newImages];
    const thumbnail = allImages[0]?.src || existing?.image || null;

    const item = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        desc,
        longDesc,
        features: features ? JSON.parse(features) : undefined,
        tags: tags ? JSON.parse(tags) : undefined,
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
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });
    for (const img of existing?.images || []) {
      const filePath = path.join(__dirname, '../uploads', img.src);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.project.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
