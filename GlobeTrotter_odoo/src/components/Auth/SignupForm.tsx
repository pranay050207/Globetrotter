import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Camera, X } from 'lucide-react';
import { apiFetch, setAccessToken } from '../../utils/api';
import FluidCanvas from '../FluidCanvas';

interface SignupFormProps {
  onSignup: (role: 'user' | 'admin') => void;
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const body = new FormData();
      body.append('full_name', fullName);
      body.append('email', formData.email);
      body.append('password', formData.password);
      body.append('role', 'user');
      if (profilePicture) {
        body.append('avatar', profilePicture);
      } else {
        // Backend expects avatar; if not provided, send empty Blob
        body.append('avatar', new Blob([], { type: 'application/octet-stream' }), 'avatar.png');
      }

      const res = await apiFetch<{ message: string; user_id: number; avatar_url?: string; otp?: string; access_token: string }>(
        '/auth/signup',
        { method: 'POST', body, isFormData: true }
      );
      console.log(res);
      

      setAccessToken(res.access_token);
      setMessage(res.message || 'Account created. Please verify OTP sent to your email.');
      onSignup('user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fluid Canvas Background */}
      <FluidCanvas />

      {/* Scrim */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none scrim-overlay" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 animate-bounce-in">
            <img 
              src="/assests/logo.png" 
              alt="GlobeTrotter Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-2 sm:mb-3 animate-fade-in-up">Create Account</h2>
          <p className="text-sm sm:text-base text-body-muted animate-fade-in-up animate-delay-200">Start planning amazing trips today</p>
        </div>

        {/* Signup Form */}
        <div className="glass-card-lg p-6 sm:p-8 animate-fade-in-up animate-delay-300">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <label htmlFor="profilePicture" className="block text-sm font-medium text-heading mb-3">
                Profile Picture
              </label>
              <div className="relative inline-block">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-glass-border"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600 transition-colors"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePicture"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-glass-border flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-white/5 transition-all mx-auto"
                  >
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-body-muted mb-1" />
                    <span className="text-xs text-body-muted">Upload</span>
                  </label>
                )}
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-body-muted mt-2">Upload a profile picture (optional)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-heading mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-body-muted" />
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="input-field pl-10 pr-4"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-heading mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-heading mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-body-muted" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="input-field pl-10 pr-4"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-heading mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-body-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="input-field pl-10 pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-body-muted hover:text-heading transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-heading mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-body-muted" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="input-field pl-10 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-body-muted hover:text-heading transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" required className="rounded border-glass-border bg-white/10 text-primary-500 focus:ring-primary-400 mt-1" />
              <span className="ml-2 text-xs sm:text-sm text-body-muted">
                I agree to the <a href="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and <a href="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
              </span>
            </div>

            {error && <div className="text-sm text-error-400 bg-error-500/10 border border-error-500/20 rounded-xl p-3">{error}</div>}
            {message && <div className="text-sm text-success-400 bg-success-500/10 border border-success-500/20 rounded-xl p-3">{message}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-4 sm:mt-6">
            <span className="text-sm text-body-muted">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
