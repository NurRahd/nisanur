const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'portfolio';

/**
 * Parse multipart form data from Vercel serverless request.
 * Returns { fields, files } where files is array of { fieldname, originalname, buffer, mimetype }
 */
async function parseMultipart(req) {
  const busboy = require('busboy');
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];

    const bb = busboy({ headers: req.headers });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          fieldname: name,
          originalname: info.filename,
          mimetype: info.mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);

    req.pipe(bb);
  });
}

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL.
 */
async function uploadToSupabase(buffer, originalname, mimetype) {
  const ext = path.extname(originalname).toLowerCase();
  const filename = `${uuidv4()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: mimetype, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return { filename, publicUrl: data.publicUrl };
}

/**
 * Delete a file from Supabase Storage.
 * filename can be just the filename or a full URL — we extract the filename.
 */
async function deleteFromSupabase(filename) {
  if (!filename) return;
  // If it's a full URL, extract just the filename
  const name = filename.includes('/') ? filename.split('/').pop() : filename;
  await supabase.storage.from(BUCKET).remove([name]);
}

module.exports = { parseMultipart, uploadToSupabase, deleteFromSupabase };
