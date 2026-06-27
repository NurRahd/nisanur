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
        const { title, desc, longDesc, cat, pos, github, demo, featured, order, imagePosData, keepImages } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];
        const toKeep = keepImages ? JSON.parse(keepImages) : null;

        const { data: existing } = await supabase
          .from('Project')
          .select('*, ProjectImage(*)')
          .eq('id', id)
          .single();

        const existingImages = existing?.ProjectImage || [];

        // Delete removed images
        if (toKeep !== null) {
          const toDelete = existingImages.filter((img) => !toKeep.includes(img.id));
          for (const img of toDelete) {
            await deleteFromSupabase(img.src);
            await supabase.from('ProjectImage').delete().eq('id', img.id);
          }
        }

        // Get remaining images
        const { data: remainingImages } = await supabase
          .from('ProjectImage')
          .select()
          .eq('projectId', id)
          .order('order', { ascending: true });

        // Upload new images
        const newImages = [];
        for (let i = 0; i < files.length; i++) {
          const { filename } = await uploadToSupabase(files[i].buffer, files[i].originalname, files[i].mimetype);
          newImages.push({ src: filename, pos: parsedPos[i] || '50% 50%', order: (remainingImages?.length || 0) + i, projectId: id });
        }

        if (newImages.length > 0) {
          await supabase.from('ProjectImage').insert(newImages);
        }

        const allImages = [...(remainingImages || []), ...newImages];
        const thumbnail = allImages[0]?.src || existing?.image || null;

        // Build update data (only include defined fields)
        const updateData = { updatedAt: new Date().toISOString() };
        if (title !== undefined) updateData.title = title;
        if (desc !== undefined) updateData.desc = desc;
        if (longDesc !== undefined) updateData.longDesc = longDesc;
        if (fields.features) updateData.features = JSON.parse(fields.features);
        if (fields.tags) updateData.tags = JSON.parse(fields.tags);
        if (cat !== undefined) updateData.cat = cat;
        updateData.pos = pos || existing?.pos;
        if (github !== undefined) updateData.github = github || null;
        if (demo !== undefined) updateData.demo = demo || null;
        updateData.image = thumbnail;
        if (featured !== undefined) updateData.featured = featured === 'true';
        if (order !== undefined) updateData.order = Number(order);

        await supabase.from('Project').update(updateData).eq('id', id);

        // Fetch complete project
        const { data: item } = await supabase
          .from('Project')
          .select('*, ProjectImage(*)')
          .eq('id', id)
          .single();

        item.images = (item.ProjectImage || []).sort((a, b) => a.order - b.order);
        delete item.ProjectImage;
        return res.json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const { data: existing } = await supabase
          .from('Project')
          .select('*, ProjectImage(*)')
          .eq('id', id)
          .single();

        for (const img of existing?.ProjectImage || []) await deleteFromSupabase(img.src);
        // Cascade delete handles ProjectImage via FK
        const { error } = await supabase.from('Project').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
