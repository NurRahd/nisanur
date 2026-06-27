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
        const { name, issuer, certificateId, issued, expires, file, imagePos, imageFit, imageZoom, order } = fields;
        const { data: existing } = await supabase.from('Certificate').select().eq('id', id).single();
        let image = existing?.image;
        if (files.length > 0) {
          if (existing?.image) await deleteFromSupabase(existing.image);
          const { filename } = await uploadToSupabase(files[0].buffer, files[0].originalname, files[0].mimetype);
          image = filename;
        }
        const updateData = {
          name, issuer, certificateId, issued, expires,
          file: file || null, image,
          updatedAt: new Date().toISOString(),
        };
        if (imagePos !== undefined) updateData.imagePos = imagePos || existing?.imagePos;
        if (imageFit !== undefined) updateData.imageFit = imageFit || existing?.imageFit;
        if (imageZoom !== undefined) updateData.imageZoom = imageZoom ? parseFloat(imageZoom) : existing?.imageZoom;
        if (order !== undefined) updateData.order = Number(order);

        const { data: item, error } = await supabase
          .from('Certificate')
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
        const { data: existing } = await supabase.from('Certificate').select().eq('id', id).single();
        if (existing?.image) await deleteFromSupabase(existing.image);
        const { error } = await supabase.from('Certificate').delete().eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Deleted' });
      } catch { return res.status(500).json({ error: 'Server error' }); }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
