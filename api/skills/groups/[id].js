const supabase = require('../../_lib/supabase');
const authMiddleware = require('../../_lib/auth');
const setCors = require('../../_lib/cors');
const { deleteFromSupabase } = require('../../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { title, order } = req.body;
        const { data: group, error } = await supabase
          .from('SkillGroup')
          .update({ title, order })
          .eq('id', id)
          .select('*, Skill(*)')
          .single();
        if (error) throw error;
        // Normalize relation key
        group.skills = (group.Skill || []).sort((a, b) => a.order - b.order);
        delete group.Skill;
        return res.json(group);
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        // Get skills to clean up images
        const { data: skills } = await supabase.from('Skill').select().eq('skillGroupId', id);
        for (const skill of skills || []) {
          if (skill.iconImage) await deleteFromSupabase(skill.iconImage);
        }
        // Cascade delete handled by DB foreign key
        const { error } = await supabase.from('SkillGroup').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
