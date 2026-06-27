const { createClient } = require('@supabase/supabase-js');

const globalForSupabase = globalThis;

if (!globalForSupabase._supabase) {
  globalForSupabase._supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

module.exports = globalForSupabase._supabase;
