// Frontend API Client - Routes requests through goonsync.com API
// This works on school WiFi because it doesn't call Supabase directly!
// FIXED VERSION - Proper insert().select() chaining

class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
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
    return new QueryBuilder(table, this.baseURL);
  }
}

class QueryBuilder {
  constructor(table, baseURL) {
    this.table = table;
    this.baseURL = baseURL;
    this.selectFields = '*';
    this.filtersList = {};
    this.orderBy = null;
    this.isSingle = false;
    this.isCount = false;
    this.isHead = false;
    this.insertedData = null;
    this.updateData = null;
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

  async delete() {
    const response = await fetch(`${this.baseURL}/api/database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: this.table,
        action: 'delete',
        filters: this.filtersList
      })
    });
    const result = await response.json();
    if (!response.ok) return { error: new Error(result.error) };
    return { error: null };
  }

  // Then is called when awaiting the query
  async then(resolve, reject) {
    try {
      // If we have inserted data, this is an insert query
      if (this.insertedData !== null) {
        const response = await fetch(`${this.baseURL}/api/database`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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

      // Otherwise it's a select/count query
      let action = 'select';
      if (this.isCount) action = 'count';

      const response = await fetch(`${this.baseURL}/api/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this.table,
          action,
          select: this.selectFields,
          filters: this.filtersList,
          order: this.orderBy
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
