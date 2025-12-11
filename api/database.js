// api/database.js - Vercel Serverless Function for authenticated Supabase operations

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get request body
    const { table, action, data, filters, options } = req.body;

    if (!table || !action) {
      return res.status(400).json({ error: 'Missing required parameters: table, action' });
    }

    // Create authenticated Supabase client with JWT
    const authedSupabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    let query;

    // Handle different actions
    switch (action) {
      case 'select':
        query = authedSupabase.from(table).select('*');
        
        // Apply filters if provided
        if (filters && Array.isArray(filters)) {
          filters.forEach(filter => {
            if (filter.type === 'eq') {
              query = query.eq(filter.column, filter.value);
            } else if (filter.type === 'in') {
              query = query.in(filter.column, filter.value);
            } else if (filter.type === 'gte') {
              query = query.gte(filter.column, filter.value);
            } else if (filter.type === 'lte') {
              query = query.lte(filter.column, filter.value);
            } else if (filter.type === 'gt') {
              query = query.gt(filter.column, filter.value);
            } else if (filter.type === 'lt') {
              query = query.lt(filter.column, filter.value);
            } else if (filter.type === 'not') {
              query = query.not(filter.column, filter.operator, filter.value);
            }
          });
        }

        // Apply options if provided
        if (options) {
          if (options.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending });
          }
          if (options.limit) {
            query = query.limit(options.limit);
          }
          if (options.single) {
            query = query.single();
          }
        }

        const { data: selectData, error: selectError } = await query;
        
        if (selectError) {
          return res.status(400).json({ error: selectError.message, details: selectError });
        }
        
        return res.status(200).json({ data: selectData });

      case 'insert':
        const { data: insertData, error: insertError } = await authedSupabase
          .from(table)
          .insert(data)
          .select();
        
        if (insertError) {
          return res.status(400).json({ error: insertError.message, details: insertError });
        }
        
        return res.status(200).json({ data: insertData });

      case 'update':
        query = authedSupabase.from(table).update(data);
        
        // Apply filters
        if (filters && Array.isArray(filters)) {
          filters.forEach(filter => {
            if (filter.type === 'eq') {
              query = query.eq(filter.column, filter.value);
            }
          });
        }

        const { data: updateData, error: updateError } = await query.select();
        
        if (updateError) {
          return res.status(400).json({ error: updateError.message, details: updateError });
        }
        
        return res.status(200).json({ data: updateData });

      case 'upsert':
        const { data: upsertData, error: upsertError } = await authedSupabase
          .from(table)
          .upsert(data, options || {})
          .select();
        
        if (upsertError) {
          return res.status(400).json({ error: upsertError.message, details: upsertError });
        }
        
        return res.status(200).json({ data: upsertData });

      case 'delete':
        query = authedSupabase.from(table).delete();
        
        // Apply filters
        if (filters && Array.isArray(filters)) {
          filters.forEach(filter => {
            if (filter.type === 'eq') {
              query = query.eq(filter.column, filter.value);
            }
          });
        }

        const { data: deleteData, error: deleteError } = await query;
        
        if (deleteError) {
          return res.status(400).json({ error: deleteError.message, details: deleteError });
        }
        
        return res.status(200).json({ data: deleteData });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
