import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Creating storage bucket...');

  const { data, error } = await supabase.storage.createBucket('portfolio', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  });

  if (error) {
    if (error.message?.includes('already exists')) {
      console.log('✓ Bucket "portfolio" already exists');
    } else {
      console.error('✗ Error:', error.message);
    }
  } else {
    console.log('✓ Bucket "portfolio" created successfully');
  }

  // Set public access policy
  const { error: policyError } = await supabase.storage
    .from('portfolio')
    .list('', { limit: 1 });

  if (!policyError) {
    console.log('✓ Bucket is accessible');
  }

  console.log('\n✅ Storage setup complete!');
  console.log(`Bucket URL: ${process.env.SUPABASE_URL}/storage/v1/object/public/portfolio/`);
}

main().catch(console.error);
