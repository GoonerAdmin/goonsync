// Vercel Serverless Function - Database Proxy
// NOW WITH USER AUTHENTICATION SUPPORT!

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { table, action, data: queryData, filters, select, order, limit } = req.body;

  // CRITICAL: Get user's JWT token from Authorization header
  const authHeader = req.headers.authorization;
  const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    let method = 'GET';
    let body = null;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      // CRITICAL: Use user's token if provided, otherwise anon key
      'Authorization': userToken ? `Bearer ${userToken}` : `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    };

    switch (action) {
      case 'select': {
        method = 'GET';
        headers['Prefer'] = 'count=exact';
        
        // Build query params
        const params = new URLSearchParams();
        if (select && select !== '*') params.append('select', select);
        
        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (key.endsWith('_in')) {
              const actualKey = key.replace('_in', '');
              params.append(actualKey, `in.(${value.join(',')})`);
            } else {
              params.append(key, `eq.${value}`);
            }
          });
        }
        
        // Apply ordering
        if (order) {
          params.append('order', `${order.column}.${order.ascending !== false ? 'asc' : 'desc'}`);
        }
        
        // Apply limit
        if (limit) {
          params.append('limit', limit);
        }
        
        if (params.toString()) url += '?' + params.toString();
        break;
      }

      case 'insert': {
        method = 'POST';
        body = JSON.stringify(queryData);
        break;
      }

      case 'update': {
        method = 'PATCH';
        body = JSON.stringify(queryData);
        
        // Apply filters
        if (filters) {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            params.append(key, `eq.${value}`);
          });
          url += '?' + params.toString();
        }
        break;
      }

      case 'delete': {
        method = 'DELETE';
        
        // Apply filters
        if (filters) {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            params.append(key, `eq.${value}`);
          });
          url += '?' + params.toString();
        }
        break;
      }

      case 'count': {
        method = 'GET';
        headers['Prefer'] = 'count=exact';
        url += '?select=*&limit=0';
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Supabase error:', responseData);
      throw new Error(responseData.message || responseData.hint || 'Database operation failed');
    }

    // Extract count from header if needed
    const count = response.headers.get('content-range')?.split('/')[1];

    return res.status(200).json({ 
      data: responseData, 
      count: count ? parseInt(count) : null 
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(400).json({ error: error.message });
  }
}
