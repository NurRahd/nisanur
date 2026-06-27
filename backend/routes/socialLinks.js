const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/social-links — public
router.get('/', async (req, res) => {
  try {
    const links = await prisma.socialLink.findMany({ orderBy: { order: 'asc' } });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/social-links — admin
router.post('/', auth, async (req, res) => {
  try {
    const { platform, label, value, href, iconType, iconName, iconImage, order } = req.body;
    const link = await prisma.socialLink.create({
      data: { platform, label, value, href, iconType: iconType || 'image', iconName, iconImage, order: order ?? 0 },
    });
    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/social-links/:id — admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { platform, label, value, href, iconType, iconName, iconImage, order } = req.body;
    const link = await prisma.socialLink.update({
      where: { id: Number(req.params.id) },
      data: { platform, label, value, href, iconType, iconName, iconImage, order },
    });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/social-links/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.socialLink.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
