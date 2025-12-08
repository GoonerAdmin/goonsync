// 🔌 Supabase Client Configuration
// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://tjtxtoeydnkgymovxqqr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y';

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
