// In a real Vite app, these would be import.meta.env.VITE_SUPABASE_URL
// For this generation, we use the provided values as defaults.

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://zgkovghzfzrgpxjobq.supabase.co";
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_ICFao23PmLonXjt4MzDtxQ_GLgBc2Y1";

export const APP_NAME = "NovaPOS";
export const CURRENCY = "$";