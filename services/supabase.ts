import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Key is missing!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check connection
export const checkConnection = async () => {
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn("Database connection issue or tables not created yet:", e);
    return false;
  }
};