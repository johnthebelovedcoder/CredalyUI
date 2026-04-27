import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock sonner toast — must be before any imports that use it
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  };
});

// We'll test the login form directly by creating a minimal test that doesn't depend on AuthContext
describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockToastError.mockClear();
    mockToastSuccess.mockClear();
    vi.resetModules();
  });

  it('renders the login form with email and password fields', async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    const { AuthProvider } = await import('@/context/AuthContext');

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('disables submit button when form is empty', async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    const { AuthProvider } = await import('@/context/AuthContext');

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows/hides password when toggle button is clicked', async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    const { AuthProvider } = await import('@/context/AuthContext');
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('submits the form and navigates on success', async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    const { AuthProvider } = await import('@/context/AuthContext');
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(emailInput, 'admin@credaly.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', expect.objectContaining({ replace: true }));
    }, { timeout: 3000 });
  });
});
