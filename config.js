// Supabase Configuration
const SUPABASE_URL = 'https://hpudpcwmqmquwdcnbfni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdWRwY3dtcW1xdXdkY25iZm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2Nzc5MzcsImV4cCI6MTcxOTIzNDEzN30.Pl7jNmXvYaEVmK9N_ZkjU7_q8mK1KlL8p3L9Q7E4o_Q';

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
