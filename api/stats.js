// Vercel Serverless Function - Landing Page Stats
// Gets public stats using direct fetch to Supabase REST API

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'count=exact'
    };

    // Get users count
    const usersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=*&limit=0`,
      { headers }
    );
    const usersCount = parseInt(usersResponse.headers.get('content-range')?.split('/')[1] || '0');

    // Get sessions count
    const sessionsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/sessions?select=*&limit=0`,
      { headers }
    );
    const sessionsCount = parseInt(sessionsResponse.headers.get('content-range')?.split('/')[1] || '0');

    // Get circles count
    const circlesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/circles?select=*&limit=0`,
      { headers }
    );
    const circlesCount = parseInt(circlesResponse.headers.get('content-range')?.split('/')[1] || '0');

    // Get total time tracked
    const sessionsDataResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/sessions?select=duration_seconds`,
      { headers }
    );
    const sessionsData = await sessionsDataResponse.json();
    
    const totalHours = sessionsData && Array.isArray(sessionsData)
      ? Math.floor(sessionsData.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 3600)
      : 0;

    const stats = {
      users: usersCount || 0,
      sessions: sessionsCount || 0,
      circles: circlesCount || 0,
      hours: totalHours
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      users: 0,
      sessions: 0,
      circles: 0,
      hours: 0
    });
  }
}
