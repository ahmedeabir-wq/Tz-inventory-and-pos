// Netlify/Vite friendly environment variables
// It prioritizes VITE_ environment variables set in the Netlify dashboard

const getEnv = (key: string): string | undefined => {
  return (import.meta as any).env?.[key];
};

export const SUPABASE_URL = 
  getEnv('VITE_SUPABASE_URL') || 
  "https://zgkovghzfzrgpxjobq.supabase.co";

export const SUPABASE_ANON_KEY = 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  "sb_publishable_ICFao23PmLonXjt4MzDtxQ_GLgBc2Y1";

export const APP_NAME = "NovaPOS";
export const CURRENCY = "$";