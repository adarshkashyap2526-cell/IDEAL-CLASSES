// Supabase Configuration
const SUPABASE_URL = 'https://hpudpcwmqmquwdcnbfni.supabase.co';
const SUPABASE_ANON_KEY ='sb_publishable_8dRscORoHxzT41hibd0yqw_gDXwgsS7';

// Initialize Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Storage Configuration
const STORAGE_BUCKET = 'content-files';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Admin Credentials (SECURED - From environment or browser storage)
// For development: Use localStorage to store admin credentials
// For production: Use backend authentication with secure tokens
const ADMIN_EMAIL = localStorage.getItem('ADMIN_EMAIL') || 'admin@idealclasses.com'; 
const ADMIN_PASSWORD = localStorage.getItem('ADMIN_PASSWORD') || 'Bunny@2526'; 

// WARNING: Change credentials immediately and never expose in public code!
