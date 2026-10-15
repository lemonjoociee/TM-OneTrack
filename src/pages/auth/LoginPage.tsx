import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrUsername.trim()) {
      setErrorMessage('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const result = await login(emailOrUsername, password, rememberMe);
    if (result.success) {
      // Determine redirection based on credentials
      const lower = emailOrUsername.toLowerCase();
      if (lower.includes('admin')) {
        navigate('/admin');
      } else if (lower.includes('ops') || lower.includes('sivanendran')) {
        navigate('/ops');
      } else {
        navigate('/noc');
      }
    } else {
      setErrorMessage(result.message || 'Login failed. Please verify your credentials.');
    }
  };

  const fillDemoAccount = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmailOrUsername(demo.email);
    setPassword(demo.password);
    setErrorMessage('');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950 transition-colors">
      {/* Top Bar Theme Switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-lg text-xs ${
            theme === 'light' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800' : 'text-slate-500'
          }`}
          title="Light Mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-lg text-xs ${
            theme === 'dark' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800' : 'text-slate-500'
          }`}
          title="Dark Mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-1.5 rounded-lg text-xs ${
            theme === 'system' ? 'bg-slate-100 text-blue-600 dark:bg-slate-800' : 'text-slate-500'
          }`}
          title="System Mode"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20">
          TM
        </div>

        <h1 className="mt-4 text-center text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          NOC & OPS Management Portal
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Unified Operations Intelligence & Incident Governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Validation Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email / Username field */}
            <div>
              <label
                htmlFor="emailOrUsername"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="emailOrUsername"
                  type="text"
                  autoComplete="username"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="name@scicom-tm.portal"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotSent(false);
                }}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-hidden disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>
          </form>

          {/* Development Testing Demo Accounts Panel (Separated for Testing) */}
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              <span>Quick Demo Accounts (Development & QA)</span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
                Test Mode
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => fillDemoAccount(demo)}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-600 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {demo.role}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full">
                    {demo.username}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
              User role is verified automatically upon authentication.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Password Recovery
              </h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Reset Instructions Dispatched
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  If an active account exists for <span className="font-semibold text-slate-700 dark:text-slate-300">{forgotEmail}</span>, a secure password reset link has been dispatched to their email.
                </p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered work email to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="user@scicom-tm.portal"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-1/2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
