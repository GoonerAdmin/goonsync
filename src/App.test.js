import React from 'react';

// Create manual mock for Supabase before any imports
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
    }),
    channel: () => ({
      on: function() { return this; },
      subscribe: () => {},
    }),
  }),
}));

import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders without crashing', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  test('renders GoonSync', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('GoonSync')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
