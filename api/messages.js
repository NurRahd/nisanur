const supabase = require('./_lib/supabase');
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
      const { data: msg, error } = await supabase
        .from('Message')
        .insert({
          name, email, subject, message,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ message: 'Message sent successfully', id: msg.id });
    } catch (err) { return res.status(500).json({ error: 'Server error' }); }
  }

  // GET — admin only
  if (req.method === 'GET') {
    return authMiddleware(req, res, async () => {
      try {
        const { data: messages, error } = await supabase
          .from('Message')
          .select()
          .order('createdAt', { ascending: false });
        if (error) throw error;
        return res.json(messages);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
