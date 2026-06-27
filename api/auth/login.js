const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../_lib/supabase');
const setCors = require('../_lib/cors');

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const { data: admin, error } = await supabase
      .from('Admin')
      .select()
      .eq('username', username)
      .single();

    if (error || !admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
