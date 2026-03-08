import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://melsacweuhzaezovnpqc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISH_KEY || 'sb_publishable_ytFypKZsd38LV53FKfRapA_FMWYzX-M';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: false
  }
});
