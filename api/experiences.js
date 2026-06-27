const supabase = require('./_lib/supabase');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');
const { parseMultipart, uploadToSupabase } = require('./_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { data: items, error } = await supabase
        .from('Experience')
        .select()
        .order('order', { ascending: true });
      if (error) throw error;
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { period, duration, title, institution, bullets, skills, order } = fields;
        let logoImage = null;
        if (files.length > 0) {
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          logoImage = filename;
        }
        const { data: item, error } = await supabase
          .from('Experience')
          .insert({
            period, duration, title, institution,
            bullets: JSON.parse(bullets || '[]'),
            skills: JSON.parse(skills || '[]'),
            logoImage,
            order: Number(order) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
