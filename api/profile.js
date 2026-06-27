const supabase = require('./_lib/supabase');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { data: items, error } = await supabase
        .from('Profile')
        .select();
      if (error) throw error;
      const profile = {};
      for (const item of items) profile[item.key] = item.value;
      return res.json(profile);
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
          await supabase
            .from('Profile')
            .upsert({ key, value: String(value), updatedAt: new Date().toISOString() }, { onConflict: 'key' });
        }
        const { data: items } = await supabase.from('Profile').select();
        const profile = {};
        for (const item of items) profile[item.key] = item.value;
        return res.json(profile);
      } catch (err) {
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
