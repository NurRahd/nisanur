const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/education — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.education.findMany({ orderBy: { order: 'asc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/education — admin
router.post('/', auth, upload.single('logo'), async (req, res) => {
  try {
    const { school, degree, period, score, order } = req.body;
    const item = await prisma.education.create({
      data: {
        school,
        degree,
        period,
        score,
        logoImage: req.file ? req.file.filename : null,
        order: Number(order) || 0,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/education/:id — admin
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const { school, degree, period, score, order } = req.body;
    const existing = await prisma.education.findUnique({ where: { id: Number(req.params.id) } });

    if (req.file && existing?.logoImage) {
      const oldPath = path.join(__dirname, '../uploads', existing.logoImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const item = await prisma.education.update({
      where: { id: Number(req.params.id) },
      data: {
        school,
        degree,
        period,
        score,
        logoImage: req.file ? req.file.filename : existing?.logoImage,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/education/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.education.findUnique({ where: { id: Number(req.params.id) } });
    if (existing?.logoImage) {
      const filePath = path.join(__dirname, '../uploads', existing.logoImage);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.education.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
