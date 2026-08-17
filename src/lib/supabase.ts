import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://uxnvbpkbvjvzhlzsxazz.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_xJD7I3RXMC2HTC51rnLMOA_VsodZd6f";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
