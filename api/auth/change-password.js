const bcrypt = require('bcryptjs');
const prisma = require('../_lib/prisma');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  authMiddleware(req, res, async () => {
    try {
      const { currentPassword, newPassword } = req.body;
      const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
      const valid = await bcrypt.compare(currentPassword, admin.password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({ where: { id: req.admin.id }, data: { password: hashed } });
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
};
