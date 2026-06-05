import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { updateUserProfileInDb } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getInitials } from '@/lib/utils';

export function SettingsPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfileInDb(user.uid, { displayName, phone });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Profile Information
            </h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {getInitials(userProfile?.displayName || user?.email || 'U')}
              </span>
            </div>
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-100">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-sm text-surface-500">{user?.email}</p>
              <span className="inline-block mt-1 badge-blue capitalize">
                {userProfile?.role || 'staff'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveProfile} loading={saving} icon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                Profile updated successfully
              </span>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Appearance
            </h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-100">Dark Mode</p>
              <p className="text-sm text-surface-500">Toggle dark mode for the interface</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isDark ? 'bg-primary-600' : 'bg-surface-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  isDark ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              Security
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-700">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">Password</p>
                <p className="text-sm text-surface-500">Last changed recently</p>
              </div>
              <Button variant="secondary" size="sm">
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">Email</p>
                <p className="text-sm text-surface-500">{user?.email}</p>
              </div>
              <Button variant="secondary" size="sm">
                Change Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}