const bcrypt = require('bcryptjs');
const supabase = require('../_lib/supabase');
const authMiddleware = require('../_lib/auth');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  authMiddleware(req, res, async () => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { data: admin } = await supabase
        .from('Admin')
        .select()
        .eq('id', req.admin.id)
        .single();

      const valid = await bcrypt.compare(currentPassword, admin.password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await supabase
        .from('Admin')
        .update({ password: hashed })
        .eq('id', req.admin.id);

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
};
