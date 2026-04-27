import { describe, it, expect } from 'vitest';

// ProtectedRoute is tested indirectly via E2E tests.
// Unit testing it requires complex routing setup that is better covered by integration tests.
describe('ProtectedRoute', () => {
  it('exists and exports a React component', async () => {
    const { ProtectedRoute } = await import('@/components/auth/ProtectedRoute');
    expect(ProtectedRoute).toBeDefined();
    expect(typeof ProtectedRoute).toBe('function');
  });
});
