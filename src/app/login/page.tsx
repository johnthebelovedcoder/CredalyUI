"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful. Welcome back!");

      // Navigate to the page they were trying to access, or default by role
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const role = email.includes("admin") ? "/" : "/portal";
        navigate(role, { replace: true });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message;
      toast.error(message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-credaly-bg flex items-center justify-center font-sans"
      role="main"
      aria-label="Login page"
      style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(245,166,35,0.03) 0%, transparent 50%)" }}
    >
      <div className="w-full max-w-sm sm:max-w-md p-8 sm:p-10 bg-credaly-s1 border border-border/30 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-credaly-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-credaly-amber">
            <Shield size={28} className="text-credaly-amber" />
          </div>
          <h1 className="text-2xl font-bold text-credaly-text mb-2">Credaly</h1>
          <p className="text-sm text-credaly-muted">Predictive Behavioral Credit Infrastructure</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="text-[11px] font-semibold text-credaly-muted uppercase tracking-wider block mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-credaly-faint pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-credaly-s2 border border-border/30 rounded-xl py-2.5 pl-10 pr-4 text-credaly-text text-sm outline-none focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors placeholder:text-credaly-faint"
                required
                aria-required="true"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="text-[11px] font-semibold text-credaly-muted uppercase tracking-wider block mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-credaly-faint pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-credaly-s2 border border-border/30 rounded-xl py-2.5 pl-10 pr-12 text-credaly-text text-sm outline-none focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors placeholder:text-credaly-faint"
                required
                aria-required="true"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-3 text-credaly-faint hover:text-credaly-muted transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full bg-credaly-amber text-credaly-bg border-none rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            aria-label="Sign in"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-credaly-faint">
            Unauthorized access is prohibited. <br />Protected by Credaly Sentinel.
          </p>
        </div>
      </div>
    </div>
  );
}
