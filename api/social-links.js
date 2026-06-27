const supabase = require('./_lib/supabase');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { data: links, error } = await supabase
        .from('SocialLink')
        .select()
        .order('order', { ascending: true });
      if (error) throw error;
      return res.json(links);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { platform, label, value, href, iconType, iconName, iconImage, order } = req.body;
        const { data: link, error } = await supabase
          .from('SocialLink')
          .insert({
            platform, label, value, href,
            iconType: iconType || 'image', iconName, iconImage,
            order: order ?? 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(link);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
