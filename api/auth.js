// Vercel Serverless Function - Authentication Proxy
// Uses fetch API instead of Supabase SDK to avoid import issues

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y';

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
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            email: `${username}@goonsync.com`,
            password
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error_description || data.message || 'Login failed');
        }
        
        return res.status(200).json({ data: { user: data.user, session: data } });
      }

      case 'signup': {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            email: `${username}@goonsync.com`,
            password
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error_description || data.message || 'Signup failed');
        }
        
        return res.status(200).json({ data: { user: data.user, session: data } });
      }

      case 'signout': {
        // For signout, we don't need server-side action
        return res.status(200).json({ success: true });
      }

      case 'session': {
        // Cannot get session server-side without token
        // This would need to be handled client-side
        return res.status(200).json({ data: { session: null } });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(400).json({ error: error.message });
  }
}
