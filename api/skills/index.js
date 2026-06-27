const supabase = require('../_lib/supabase');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');
const { parseMultipart, uploadToSupabase } = require('../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/skills — public
  if (req.method === 'GET') {
    try {
      const { data: groups, error } = await supabase
        .from('SkillGroup')
        .select('*, Skill(*)')
        .order('order', { ascending: true });
      if (error) throw error;
      // Sort skills within each group
      for (const g of groups) {
        g.skills = (g.Skill || []).sort((a, b) => a.order - b.order);
        delete g.Skill;
      }
      return res.json(groups);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  // POST /api/skills — add skill
  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { name, iconType, iconName, order, skillGroupId } = fields;
        let iconImage = null;

        if (iconType === 'image' && files.length > 0) {
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          iconImage = filename;
        }

        const { data: skill, error } = await supabase
          .from('Skill')
          .insert({
            name,
            iconType: iconType || 'lucide',
            iconName: iconName || null,
            iconImage,
            order: Number(order) || 0,
            skillGroupId: Number(skillGroupId),
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(skill);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
