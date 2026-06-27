const supabase = require('../_lib/supabase');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { title, order } = req.body;
        const { data: group, error } = await supabase
          .from('SkillGroup')
          .insert({ title, order: order ?? 0 })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(group);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
