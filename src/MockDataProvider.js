// MockDataProvider.js - Offline development with fake data

class MockDataProvider {
  constructor() {
    this.initializeMockData();
  }

  // Initialize default mock data
  initializeMockData() {
    if (!localStorage.getItem('mock_user')) {
      const mockUser = {
        id: 'demo-user-123',
        email: 'demo@goonsync.com',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
    }

    if (!localStorage.getItem('mock_profile')) {
      const mockProfile = {
        id: 'demo-user-123',
        username: 'DemoUser',
        avatar_url: null,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
    }

    if (!localStorage.getItem('mock_circles')) {
      const mockCircles = [
        {
          id: 'circle-1',
          name: 'Demo Circle',
          invite_code: 'DEMO1234',
          created_by: 'demo-user-123',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('mock_circles', JSON.stringify(mockCircles));
    }

    if (!localStorage.getItem('mock_sessions')) {
      const mockSessions = this.generateMockSessions();
      localStorage.setItem('mock_sessions', JSON.stringify(mockSessions));
    }

    if (!localStorage.getItem('mock_active_syncs')) {
      localStorage.setItem('mock_active_syncs', JSON.stringify([]));
    }
  }

  // Generate realistic mock sessions
  generateMockSessions() {
    const sessions = [];
    const now = Date.now();
    
    // Generate 20 random sessions over the past 30 days
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const startTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 7200) + 300; // 5 min to 2 hours
      
      sessions.push({
        id: `session-${i}`,
        user_id: 'demo-user-123',
        username: 'DemoUser',
        circle_id: 'circle-1',
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 1000).toISOString(),
        duration_seconds: duration,
        created_at: startTime.toISOString()
      });
    }

    return sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Mock Auth Methods
  async getSession() {
    const user = JSON.parse(localStorage.getItem('mock_user'));
    return {
      data: {
        session: user ? { user } : null
      }
    };
  }

  onAuthStateChange(callback) {
    // Simulate auth state
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('mock_user'));
      callback('SIGNED_IN', { user });
    }, 100);

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }

  async signInWithPassword({ email, password }) {
    // Simulate delay
    await this.delay(500);

    if (password.length < 6) {
      return {
        error: { message: 'Password must be at least 6 characters' }
      };
    }

    const user = {
      id: 'demo-user-123',
      email: email,
      created_at: new Date().toISOString()
    };

    localStorage.setItem('mock_user', JSON.stringify(user));
    
    return {
      data: { user },
      error: null
    };
  }

  async signUp({ email, password, options }) {
    await this.delay(500);

    if (password.length < 6) {
      return {
        error: { message: 'Password must be at least 6 characters' }
      };
    }

    const user = {
      id: 'demo-user-123',
      email: email,
      created_at: new Date().toISOString()
    };

    const profile = {
      id: 'demo-user-123',
      username: options?.data?.username || email.split('@')[0],
      avatar_url: null,
      created_at: new Date().toISOString()
    };

    localStorage.setItem('mock_user', JSON.stringify(user));
    localStorage.setItem('mock_profile', JSON.stringify(profile));

    return {
      data: { user },
      error: null
    };
  }

  async signOut() {
    localStorage.removeItem('mock_user');
    return { error: null };
  }

  // Mock Database Methods
  from(table) {
    return new MockTable(table);
  }

  // Mock Storage Methods
  get storage() {
    return {
      from: (bucket) => new MockStorage(bucket)
    };
  }

  // Mock Realtime
  channel(name) {
    return {
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    };
  }

  // Helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class MockTable {
  constructor(table) {
    this.table = table;
    this.filters = {};
  }

  select(columns = '*') {
    this.columns = columns;
    return this;
  }

  eq(column, value) {
    this.filters[column] = value;
    return this;
  }

  not(column, operator, value) {
    this.filters[`not_${column}`] = { operator, value };
    return this;
  }

  in(column, values) {
    this.filters[`in_${column}`] = values;
    return this;
  }

  order(column, options) {
    this.orderBy = { column, ...options };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve) {
    await new Promise(r => setTimeout(r, 100)); // Simulate network delay

    let data = JSON.parse(localStorage.getItem(`mock_${this.table}`) || '[]');

    // Apply filters
    if (this.filters.id) {
      data = data.filter(item => item.id === this.filters.id);
    }
    if (this.filters.user_id) {
      data = data.filter(item => item.user_id === this.filters.user_id);
    }
    if (this.filters.circle_id) {
      data = data.filter(item => item.circle_id === this.filters.circle_id);
    }

    // Handle NOT filters
    if (this.filters.not_duration_seconds) {
      data = data.filter(item => item.duration_seconds !== null);
    }

    // Handle ordering
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = a[this.orderBy.column];
        const bVal = b[this.orderBy.column];
        if (this.orderBy.ascending) {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Handle limit
    if (this.limitCount) {
      data = data.slice(0, this.limitCount);
    }

    // Handle single
    if (this.isSingle) {
      data = data[0] || null;
    }

    resolve({ data, error: null });
  }

  async insert(records) {
    await new Promise(r => setTimeout(r, 100));

    const data = JSON.parse(localStorage.getItem(`mock_${this.table}`) || '[]');
    const newRecords = Array.isArray(records) ? records : [records];

    newRecords.forEach(record => {
      record.id = record.id || `${this.table}-${Date.now()}-${Math.random()}`;
      record.created_at = record.created_at || new Date().toISOString();
      data.push(record);
    });

    localStorage.setItem(`mock_${this.table}`, JSON.stringify(data));

    if (this.isSingle) {
      return { data: newRecords[0], error: null };
    }

    return { data: newRecords, error: null };
  }

  async update(updates) {
    await new Promise(r => setTimeout(r, 100));

    let data = JSON.parse(localStorage.getItem(`mock_${this.table}`) || '[]');

    data = data.map(item => {
      let matches = true;
      Object.keys(this.filters).forEach(key => {
        if (item[key] !== this.filters[key]) matches = false;
      });

      if (matches) {
        return { ...item, ...updates };
      }
      return item;
    });

    localStorage.setItem(`mock_${this.table}`, JSON.stringify(data));

    return { data: null, error: null };
  }

  async delete() {
    await new Promise(r => setTimeout(r, 100));

    let data = JSON.parse(localStorage.getItem(`mock_${this.table}`) || '[]');

    data = data.filter(item => {
      let matches = true;
      Object.keys(this.filters).forEach(key => {
        if (item[key] !== this.filters[key]) matches = false;
      });
      return !matches;
    });

    localStorage.setItem(`mock_${this.table}`, JSON.stringify(data));

    return { data: null, error: null };
  }
}

class MockStorage {
  constructor(bucket) {
    this.bucket = bucket;
  }

  async upload(path, file) {
    await new Promise(r => setTimeout(r, 500));

    // Simulate file upload by storing base64
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const mockUrl = `mock://storage/${this.bucket}/${path}`;
        localStorage.setItem(`mock_storage_${path}`, reader.result);
        resolve({ data: { path: mockUrl }, error: null });
      };
      reader.readAsDataURL(file);
    });
  }

  getPublicUrl(path) {
    const stored = localStorage.getItem(`mock_storage_${path}`);
    return {
      data: { publicUrl: stored || `mock://storage/${this.bucket}/${path}` }
    };
  }
}

// Create and export mock provider
export const mockSupabase = new MockDataProvider();

// Export auth object separately for compatibility
mockSupabase.auth = {
  getSession: mockSupabase.getSession.bind(mockSupabase),
  onAuthStateChange: mockSupabase.onAuthStateChange.bind(mockSupabase),
  signInWithPassword: mockSupabase.signInWithPassword.bind(mockSupabase),
  signUp: mockSupabase.signUp.bind(mockSupabase),
  signOut: mockSupabase.signOut.bind(mockSupabase)
};

export default mockSupabase;
