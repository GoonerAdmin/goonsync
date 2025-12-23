// 🔌 Supabase Client Configuration
// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure your .env file contains:');
  console.error('REACT_APP_SUPABASE_URL=your-project-url');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your-anon-key');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log connection status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase client initialized');
  console.log('📍 Project URL:', supabaseUrl);
}
