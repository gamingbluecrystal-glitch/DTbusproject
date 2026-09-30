import { createClient } from '@supabase/supabase-js';
import { StorageService } from './storageService';

/**
 * Supabase client instance initialized from environment variables or Admin Settings.
 * If credentials are not present, fallback local persistence is automatically used.
 */
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const settings = typeof window !== 'undefined' ? StorageService.getSettings() : { supabaseUrl: '', supabaseAnonKey: '' };
const activeUrl = envUrl || settings.supabaseUrl;
const activeKey = envKey || settings.supabaseAnonKey;

export const supabase = activeUrl && activeKey 
  ? createClient(activeUrl, activeKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
