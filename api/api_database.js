// Vercel Serverless Function - Database Proxy
// Proxies database queries to Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://tjtxtoeydnkgymovxqqr.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHh0b2V5ZG5rZ3ltb3Z4cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTQ2NzEsImV4cCI6MjA4MDM3MDY3MX0.abZaguuR3CYE_5Gdu7BWniRZL3On_8hVYqhBJg84C1Y'
);

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

  const { table, action, data: queryData, filters, select, order } = req.body;

  try {
    let query = supabase.from(table);

    switch (action) {
      case 'select': {
        query = query.select(select || '*');
        
        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        // Apply ordering
        if (order) {
          query = query.order(order.column, { ascending: order.ascending !== false });
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return res.status(200).json({ data, count });
      }

      case 'insert': {
        const { data, error } = await query.insert(queryData).select();
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case 'update': {
        query = query.update(queryData);
        
        // Apply filters for update
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data, error } = await query.select();
        if (error) throw error;
        return res.status(200).json({ data });
      }

      case 'delete': {
        // Apply filters for delete
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { error } = await query.delete();
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      case 'count': {
        const { count, error } = await query.select('*', { count: 'exact', head: true });
        if (error) throw error;
        return res.status(200).json({ count });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(400).json({ error: error.message });
  }
}
