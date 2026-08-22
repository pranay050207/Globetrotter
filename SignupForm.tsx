import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Camera, X, MapPin, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../utils/api';

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
        body.append('avatar', new Blob([], { type: 'application/octet-stream' }), 'avatar.png');
      }

      const res = await apiFetch<{ message: string; user_id: number; avatar_url?: string; otp?: string }>(
        '/auth/signup',
        { method: 'POST', body, isFormData: true }
      );

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
    <div className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative bg-secondary-900">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/assests/travel collage with passport tickets camera.avif')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 via-secondary-900/90 to-secondary-900" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-800 mb-5">
            <MapPin className="w-7 h-7 text-accent-400" strokeWidth={2.25} />
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Create account</h2>
          <p className="text-secondary-300">Start planning your first trip today</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-strong border border-white/10 overflow-hidden">
          <div className="route-divider text-primary-100 px-6 sm:px-8 pt-6" />
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <label htmlFor="profilePicture" className="block text-sm font-semibold text-secondary-700 mb-3">
                Profile Picture
              </label>
              <div className="relative inline-block">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-secondary-100"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-1.5 -right-1.5 bg-error-600 text-white rounded-full p-1 hover:bg-error-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePicture"
                    className="w-20 h-20 rounded-full border-2 border-dashed border-secondary-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors mx-auto"
                  >
                    <Camera className="w-5 h-5 text-secondary-400 mb-1" />
                    <span className="text-xs text-secondary-500">Upload</span>
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
              <p className="text-xs text-secondary-500 mt-2">Optional</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-secondary-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-secondary-700 mb-2">
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
              <label htmlFor="email" className="block text-sm font-semibold text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="input-field pl-10 pr-11"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-secondary-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="input-field pl-10 pr-11"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" required className="rounded border-secondary-300 text-primary-700 focus:ring-primary-400 mt-1" />
              <span className="ml-2.5 text-xs text-secondary-600">
                I agree to the <a href="#" className="text-primary-700 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary-700 hover:underline">Privacy Policy</a>
              </span>
            </div>

            {error && (
              <div className="text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg p-3">{error}</div>
            )}
            {message && (
              <div className="text-sm text-success-700 bg-success-50 border border-success-200 rounded-lg p-3">{message}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-3" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pb-7">
            <span className="text-sm text-secondary-600">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-primary-700 hover:text-primary-800 font-semibold text-sm hover:underline"
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
