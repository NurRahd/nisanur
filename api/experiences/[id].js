const supabase = require('../_lib/supabase');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');
const { parseMultipart, uploadToSupabase, deleteFromSupabase } = require('../_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { period, duration, title, institution, bullets, skills, order } = fields;
        const { data: existing } = await supabase.from('Experience').select().eq('id', id).single();
        let logoImage = existing?.logoImage;
        if (files.length > 0) {
          if (existing?.logoImage) await deleteFromSupabase(existing.logoImage);
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          logoImage = filename;
        }
        const updateData = {
          period, duration, title, institution, logoImage,
          updatedAt: new Date().toISOString(),
        };
        if (bullets) updateData.bullets = JSON.parse(bullets);
        if (skills) updateData.skills = JSON.parse(skills);
        if (order !== undefined) updateData.order = Number(order);

        const { data: item, error } = await supabase
          .from('Experience')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const { data: existing } = await supabase.from('Experience').select().eq('id', id).single();
        if (existing?.logoImage) await deleteFromSupabase(existing.logoImage);
        const { error } = await supabase.from('Experience').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
