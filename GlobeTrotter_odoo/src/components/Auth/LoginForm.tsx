import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, Zap } from 'lucide-react';
import { apiFetch, setAccessToken, decodeJwtPayload } from '../../utils/api';
import { useScrollAnimation } from '../../utils/useScrollAnimation';
import FluidCanvas from '../FluidCanvas';

interface LoginFormProps {
  onLogin: (role: 'user' | 'admin') => void;
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const formRef = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // OAuth2PasswordRequestForm expects: username, password (form-encoded)
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);

      const res = await apiFetch<{ access_token: string; token_type: string }>(
        '/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form as unknown as BodyInit,
        }
      );
      console.log(res);
      

      setAccessToken(res.access_token);
      const payload = decodeJwtPayload<{ role?: 'user' | 'admin' }>(res.access_token);
      const role: 'user' | 'admin' = payload?.role ?? (email.includes('admin') ? 'admin' : 'user');
      onLogin(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Fluid Canvas Background */}
      <FluidCanvas />

      {/* Scrim */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none scrim-overlay" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 animate-bounce-in">
            <div className="relative">
              <img 
                src="/assests/logo.png" 
                alt="GlobeTrotter Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-3 sm:mb-4 animate-fade-in-up animate-delay-200">
            Welcome back
          </h2>
          <p className="text-lg sm:text-xl text-body-muted animate-fade-in-up animate-delay-400">
            Plan your next adventure with GlobeTrotter
          </p>
        </div>

        {/* Login Form */}
        <div 
          ref={formRef.elementRef as React.RefObject<HTMLDivElement>}
          className={`glass-card-lg p-8 sm:p-10 relative z-20 ${formRef.isVisible ? 'animate-scale-in' : ''}`}
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="animate-fade-in-up animate-delay-600">
              <label htmlFor="email" className="block text-sm font-semibold text-heading mb-3">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted group-focus-within:text-primary-400 transition-colors duration-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field pl-12 pr-4"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-700">
              <label htmlFor="password" className="block text-sm font-semibold text-heading mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-body-muted group-focus-within:text-primary-400 transition-colors duration-300" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-body-muted hover:text-heading transition-colors duration-300 p-1 rounded-lg hover:bg-white/10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 animate-fade-in-up animate-delay-800">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="rounded border-glass-border bg-white/10 text-primary-500 focus:ring-primary-400 focus:ring-2 transition-all duration-300" />
                <span className="ml-3 text-sm text-body-muted group-hover:text-heading transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-400 hover:text-primary-300 font-semibold hover:underline transition-all duration-300">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="text-sm text-error-400 bg-error-500/10 border border-error-500/20 rounded-xl p-3 animate-fade-in-up">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full group relative overflow-hidden animate-fade-in-up animate-delay-900"
            >
              <span className="relative z-50 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6 sm:mt-8 animate-fade-in-up animate-delay-1100">
            <span className="text-sm text-body-muted">Don't have an account? </span>
            <button
              onClick={onSwitchToSignup}
              className="text-primary-400 hover:text-primary-300 font-semibold text-sm hover:underline transition-all duration-300 group"
            >
              <span className="flex items-center inline-flex">
                Sign up
                <Sparkles className="w-4 h-4 ml-1 group-hover:animate-pulse" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
