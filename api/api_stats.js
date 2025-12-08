// Vercel Serverless Function - Landing Page Stats
// Gets public stats for landing page (works on school WiFi)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y'
);

export default async function handler(req, res) {
  // CORS headers - allow from anywhere for landing page
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
    // Get total users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total sessions count
    const { count: sessionsCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    // Get total circles count
    const { count: circlesCount } = await supabase
      .from('circles')
      .select('*', { count: 'exact', head: true });

    // Get total time tracked (in hours)
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('duration_seconds');
    
    const totalHours = sessionsData
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
