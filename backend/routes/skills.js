const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/skills — public
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.skillGroup.findMany({
      orderBy: { order: 'asc' },
      include: { skills: { orderBy: { order: 'asc' } } },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/skills/groups — admin
router.post('/groups', auth, async (req, res) => {
  try {
    const { title, order } = req.body;
    const group = await prisma.skillGroup.create({ data: { title, order: order ?? 0 } });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/skills/groups/:id — admin
router.put('/groups/:id', auth, async (req, res) => {
  try {
    const { title, order } = req.body;
    const group = await prisma.skillGroup.update({
      where: { id: Number(req.params.id) },
      data: { title, order },
      include: { skills: { orderBy: { order: 'asc' } } },
    });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/skills/groups/:id — admin
router.delete('/groups/:id', auth, async (req, res) => {
  try {
    // Also clean up any uploaded icon images for skills in this group
    const group = await prisma.skillGroup.findUnique({
      where: { id: Number(req.params.id) },
      include: { skills: true },
    });
    for (const skill of group?.skills || []) {
      if (skill.iconImage) {
        const filePath = path.join(__dirname, '../uploads', skill.iconImage);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }
    await prisma.skillGroup.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/skills — add skill to group — admin (supports image upload)
router.post('/', auth, upload.single('iconImage'), async (req, res) => {
  try {
    const { name, iconType, iconName, order, skillGroupId } = req.body;
    const skill = await prisma.skill.create({
      data: {
        name,
        iconType: iconType || 'lucide',
        iconName: iconName || null,
        iconImage: req.file ? req.file.filename : null,
        order: Number(order) || 0,
        skillGroupId: Number(skillGroupId),
      },
    });
    res.status(201).json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/skills/:id — admin (supports image upload)
router.put('/:id', auth, upload.single('iconImage'), async (req, res) => {
  try {
    const { name, iconType, iconName, order } = req.body;
    const existing = await prisma.skill.findUnique({ where: { id: Number(req.params.id) } });

    // Remove old icon image if switching to new upload
    if (req.file && existing?.iconImage) {
      const oldPath = path.join(__dirname, '../uploads', existing.iconImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // If switching from image to lucide, clean up old image
    if (iconType === 'lucide' && existing?.iconImage && !req.file) {
      const oldPath = path.join(__dirname, '../uploads', existing.iconImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const skill = await prisma.skill.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        iconType: iconType || 'lucide',
        iconName: iconType === 'lucide' ? (iconName || null) : null,
        iconImage: iconType === 'image'
          ? (req.file ? req.file.filename : existing?.iconImage)
          : null,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/skills/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.skill.findUnique({ where: { id: Number(req.params.id) } });
    if (existing?.iconImage) {
      const filePath = path.join(__dirname, '../uploads', existing.iconImage);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.skill.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
