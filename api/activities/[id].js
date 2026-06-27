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
        const { title, date, description, longDesc, details, tags, order, imagePosData, keepImages } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];
        const toKeep = keepImages ? JSON.parse(keepImages) : null;

        const { data: existing } = await supabase
          .from('Activity')
          .select('*, ActivityImage(*)')
          .eq('id', id)
          .single();

        const existingImages = existing?.ActivityImage || [];

        if (toKeep !== null) {
          const toDelete = existingImages.filter((img) => !toKeep.includes(img.id));
          for (const img of toDelete) {
            await deleteFromSupabase(img.src);
            await supabase.from('ActivityImage').delete().eq('id', img.id);
          }
        }

        const { data: keptImages } = await supabase
          .from('ActivityImage')
          .select()
          .eq('activityId', id)
          .order('order', { ascending: true });

        const newImages = [];
        for (let i = 0; i < files.length; i++) {
          const { filename } = await uploadToSupabase(files[i].buffer, files[i].originalname, files[i].mimetype);
          newImages.push({ src: filename, pos: parsedPos[i] || '50% 50%', order: (keptImages?.length || 0) + i, activityId: id });
        }
        if (newImages.length > 0) {
          await supabase.from('ActivityImage').insert(newImages);
        }

        const updateData = { updatedAt: new Date().toISOString() };
        if (title !== undefined) updateData.title = title;
        if (date !== undefined) updateData.date = date;
        if (description !== undefined) updateData.description = description;
        if (longDesc !== undefined) updateData.longDesc = longDesc;
        if (details) updateData.details = JSON.parse(details);
        if (tags) updateData.tags = JSON.parse(tags);
        if (order !== undefined) updateData.order = Number(order);

        await supabase.from('Activity').update(updateData).eq('id', id);

        const { data: item } = await supabase
          .from('Activity')
          .select('*, ActivityImage(*)')
          .eq('id', id)
          .single();
        item.images = (item.ActivityImage || []).sort((a, b) => a.order - b.order);
        delete item.ActivityImage;
        return res.json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  if (req.method === 'DELETE') {
    return authMiddleware(req, res, async () => {
      try {
        const { data: existing } = await supabase
          .from('Activity')
          .select('*, ActivityImage(*)')
          .eq('id', id)
          .single();
        for (const img of existing?.ActivityImage || []) await deleteFromSupabase(img.src);
        const { error } = await supabase.from('Activity').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
