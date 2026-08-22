import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => void;
}

const PasswordInput = ({ label, value, onChange, isVisible, onToggleVisibility }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isVisible: boolean, onToggleVisibility: () => void }) => (
  <div>
    <label className="block text-sm font-medium text-heading mb-1">{label}</label>
    <div className="relative">
      <input
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-glass-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
        required
        minLength={8}
      />
      <button type="button" onClick={onToggleVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-body-muted hover:text-heading" aria-label={isVisible ? 'Hide password' : 'Show password'}>
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setShowCurrent(false);
      setShowNew(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    setError('');
    onSubmit(currentPassword, newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="glass-card rounded-xl shadow-glass-lg w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-heading">Change Password</h3>
              <button type="button" onClick={onClose} className="text-body-muted hover:text-body-muted" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <PasswordInput label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} isVisible={showCurrent} onToggleVisibility={() => setShowCurrent(!showCurrent)} />
              <PasswordInput label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} isVisible={showNew} onToggleVisibility={() => setShowNew(!showNew)} />
              <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} isVisible={showNew} onToggleVisibility={() => setShowNew(!showNew)} />
              {error && <p className="text-sm text-error-400">{error}</p>}
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium bg-base-100 hover:bg-base-200 text-heading transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">Update Password</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

