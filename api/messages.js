const prisma = require('./_lib/prisma');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — public (contact form)
  if (req.method === 'POST') {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message)
        return res.status(400).json({ error: 'All fields are required' });
      const msg = await prisma.message.create({ data: { name, email, subject, message } });
      return res.status(201).json({ message: 'Message sent successfully', id: msg.id });
    } catch (err) { return res.status(500).json({ error: 'Server error' }); }
  }

  // GET — admin only
  if (req.method === 'GET') {
    return authMiddleware(req, res, async () => {
      try {
        const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json(messages);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
