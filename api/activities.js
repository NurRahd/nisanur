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
        .from('Activity')
        .select('*, ActivityImage(*)')
        .order('order', { ascending: true });
      if (error) throw error;
      for (const item of items) {
        item.images = (item.ActivityImage || []).sort((a, b) => a.order - b.order);
        delete item.ActivityImage;
      }
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { title, date, description, longDesc, details, tags, order, imagePosData } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

        const { data: activity, error } = await supabase
          .from('Activity')
          .insert({
            title, date, description, longDesc,
            details: JSON.parse(details || '[]'),
            tags: JSON.parse(tags || '[]'),
            order: Number(order) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;

        const uploadedImages = [];
        for (let i = 0; i < files.length; i++) {
          const { filename } = await uploadToSupabase(files[i].buffer, files[i].originalname, files[i].mimetype);
          uploadedImages.push({ src: filename, pos: parsedPos[i] || '50% 50%', order: i, activityId: activity.id });
        }
        if (uploadedImages.length > 0) {
          await supabase.from('ActivityImage').insert(uploadedImages);
        }

        const { data: item } = await supabase
          .from('Activity')
          .select('*, ActivityImage(*)')
          .eq('id', activity.id)
          .single();
        item.images = (item.ActivityImage || []).sort((a, b) => a.order - b.order);
        delete item.ActivityImage;
        return res.status(201).json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
