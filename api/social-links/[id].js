const supabase = require('../_lib/supabase');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { platform, label, value, href, iconType, iconName, iconImage, order } = req.body;
        const { data: link, error } = await supabase
          .from('SocialLink')
          .update({ platform, label, value, href, iconType, iconName, iconImage, order, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.json(link);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const { error } = await supabase.from('SocialLink').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
