const supabase = require('./_lib/supabase');
const authMiddleware = require('./_lib/auth');
const setCors = require('./_lib/cors');
const { parseMultipart, uploadToSupabase } = require('./_lib/upload');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const featured = req.query.featured === 'true';
      let query = supabase
        .from('Project')
        .select('*, ProjectImage(*)')
        .order('order', { ascending: true });

      if (featured) query = query.eq('featured', true);

      const { data: items, error } = await query;
      if (error) throw error;

      // Normalize relation key and sort images
      for (const item of items) {
        item.images = (item.ProjectImage || []).sort((a, b) => a.order - b.order);
        delete item.ProjectImage;
      }
      return res.json(items);
    } catch { return res.status(500).json({ error: 'Server error' }); }
  }

  if (req.method === 'POST') {
    return authMiddleware(req, res, async () => {
      try {
        const { fields, files } = await parseMultipart(req);
        const { title, desc, longDesc, cat, pos, github, demo, featured, order, imagePosData } = fields;
        const parsedPos = imagePosData ? JSON.parse(imagePosData) : [];

        // Insert project first
        const { data: project, error } = await supabase
          .from('Project')
          .insert({
            title, desc, longDesc,
            features: JSON.parse(fields.features || '[]'),
            tags: JSON.parse(fields.tags || '[]'),
            cat, pos: pos || '50% 50%',
            github: github || null, demo: demo || null,
            image: null,
            featured: featured === 'true',
            order: Number(order) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;

        // Upload and insert images
        const uploadedImages = [];
        for (let i = 0; i < files.length; i++) {
          const { filename } = await uploadToSupabase(files[i].buffer, files[i].originalname, files[i].mimetype);
          uploadedImages.push({ src: filename, pos: parsedPos[i] || '50% 50%', order: i, projectId: project.id });
        }

        if (uploadedImages.length > 0) {
          await supabase.from('ProjectImage').insert(uploadedImages);
          // Update thumbnail
          await supabase.from('Project').update({ image: uploadedImages[0].src }).eq('id', project.id);
        }

        // Fetch complete project with images
        const { data: item } = await supabase
          .from('Project')
          .select('*, ProjectImage(*)')
          .eq('id', project.id)
          .single();

        item.images = (item.ProjectImage || []).sort((a, b) => a.order - b.order);
        delete item.ProjectImage;
        return res.status(201).json(item);
      } catch (err) { return res.status(500).json({ error: err.message }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
