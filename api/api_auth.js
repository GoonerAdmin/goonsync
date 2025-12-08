// Vercel Serverless Function - Authentication Proxy
// This proxies auth requests to Supabase so it works on school WiFi

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y'
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, username, password } = req.body;

  try {
    switch (action) {
      case 'login': {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username}@goonsync.com`,
          password
        });
        
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case 'signup': {
        const { data, error } = await supabase.auth.signUp({
          email: `${username}@goonsync.com`,
          password
        });
        
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case 'signout': {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      case 'session': {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return res.status(200).json({ data });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(400).json({ error: error.message });
  }
}
