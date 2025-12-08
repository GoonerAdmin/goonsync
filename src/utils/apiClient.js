// Frontend API Client - Routes requests through goonsync.com API
// This works on school WiFi because it doesn't call Supabase directly!
// FIXED VERSION - Proper insert().select() chaining

class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.accessToken = null;
  }

  // Helper method to get headers with authorization
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  // Auth methods
  auth = {
    signInWithPassword: async ({ email, password }) => {
      const username = email.replace('@goonsync.com', '');
      const response = await fetch(`${this.baseURL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      // CRITICAL: Store access token for authenticated requests
      if (result.data?.session?.access_token) {
        this.accessToken = result.data.session.access_token;
      }
      
      return result;
    },

    signUp: async ({ email, password }) => {
      const username = email.replace('@goonsync.com', '');
      const response = await fetch(`${this.baseURL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', username, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },

    signOut: async () => {
      const response = await fetch(`${this.baseURL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signout' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },

    getSession: async () => {
      const response = await fetch(`${this.baseURL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },

    onAuthStateChange: (callback) => {
      // For now, return a no-op subscription
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  };

  // Database methods
  from(table) {
    return new QueryBuilder(table, this.baseURL, this);
  }
}

class QueryBuilder {
  constructor(table, baseURL, apiClient) {
    this.table = table;
    this.baseURL = baseURL;
    this.apiClient = apiClient;
    this.selectFields = '*';
    this.filtersList = {};
    this.orderBy = null;
    this.limitValue = null;
    this.isSingle = false;
    this.isCount = false;
    this.isHead = false;
    this.insertedData = null;
    this.updateData = null;
    this.upsertData = null;
    this.upsertOptions = {};
    this.isDelete = false;
  }

  select(fields = '*', options = {}) {
    this.selectFields = fields;
    if (options.count) this.isCount = true;
    if (options.head) this.isHead = true;
    return this;
  }

  eq(column, value) {
    this.filtersList[column] = value;
    return this;
  }

  in(column, values) {
    this.filtersList[`${column}_in`] = values;
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // FIXED: insert now returns a chainable builder
  insert(data) {
    this.insertedData = data;
    // Return this builder so .select() can be called
    return this;
  }

  update(data) {
    // Store update data for later execution
    this.updateData = data;
    // Return this builder so .eq() can be called
    return this;
  }

  upsert(data, options = {}) {
    // Store upsert data and options for later execution
    this.upsertData = data;
    this.upsertOptions = options;
    // Return this builder so .select() can be called
    return this;
  }

  delete() {
    // Mark this as a delete operation
    this.isDelete = true;
    // Return this builder so .eq() can be called
    return this;
  }

  // Then is called when awaiting the query
  async then(resolve, reject) {
    try {
      // If we have inserted data, this is an insert query
      if (this.insertedData !== null) {
        const response = await fetch(`${this.baseURL}/api/database`, {
          method: 'POST',
          headers: this.apiClient.getHeaders(),
          body: JSON.stringify({
            table: this.table,
            action: 'insert',
            data: this.insertedData
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          return resolve({ data: null, error: new Error(result.error) });
        }

        let data = result.data;
        
        if (this.isSingle && data && data.length > 0) {
          data = data[0];
        }

        return resolve({ data, error: null });
      }

      // If we have update data, this is an update query
      if (this.updateData !== null && this.updateData !== undefined) {
        const response = await fetch(`${this.baseURL}/api/database`, {
          method: 'POST',
          headers: this.apiClient.getHeaders(),
          body: JSON.stringify({
            table: this.table,
            action: 'update',
            data: this.updateData,
            filters: this.filtersList
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          return resolve({ data: null, error: new Error(result.error) });
        }

        return resolve({ data: result.data, error: null });
      }

      // If we have upsert data, this is an upsert query
      if (this.upsertData !== null && this.upsertData !== undefined) {
        const response = await fetch(`${this.baseURL}/api/database`, {
          method: 'POST',
          headers: this.apiClient.getHeaders(),
          body: JSON.stringify({
            table: this.table,
            action: 'upsert',
            data: this.upsertData,
            options: this.upsertOptions
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          return resolve({ data: null, error: new Error(result.error) });
        }

        let data = result.data;
        
        if (this.isSingle && data && data.length > 0) {
          data = data[0];
        }

        return resolve({ data, error: null });
      }

      // If this is a delete operation
      if (this.isDelete) {
        const response = await fetch(`${this.baseURL}/api/database`, {
          method: 'POST',
          headers: this.apiClient.getHeaders(),
          body: JSON.stringify({
            table: this.table,
            action: 'delete',
            filters: this.filtersList
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          return resolve({ data: null, error: new Error(result.error) });
        }

        return resolve({ data: result.data, error: null });
      }

      // Otherwise it's a select/count query
      let action = 'select';
      if (this.isCount) action = 'count';

      const response = await fetch(`${this.baseURL}/api/database`, {
        method: 'POST',
        headers: this.apiClient.getHeaders(),
        body: JSON.stringify({
          table: this.table,
          action,
          select: this.selectFields,
          filters: this.filtersList,
          order: this.orderBy,
          limit: this.limitValue
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return resolve({ data: null, error: new Error(result.error), count: null });
      }

      if (this.isCount) {
        return resolve({ count: result.count, error: null });
      }

      let data = result.data;
      
      if (this.isSingle) {
        data = data && data.length > 0 ? data[0] : null;
      }

      return resolve({ data, error: null, count: result.count });
    } catch (error) {
      return resolve({ data: null, error, count: null });
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// For backwards compatibility, also export a function
export const createApiClient = () => new ApiClient();
