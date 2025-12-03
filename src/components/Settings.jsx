import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Moon, Sun, Globe, LogOut, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = ({ user, profile, onLogout, supabase, onUpdate }) => {
  const [activeSection, setActiveSection] = useState('account');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [circleInvites, setCircleInvites] = useState(true);
  const [activityUpdates, setActivityUpdates] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load user settings from database
    // This is a placeholder - you would fetch from a settings table
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to database
      // Placeholder for actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushNotifications(permission === 'granted');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-x-border z-10">
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="text-x-gray text-sm">Manage your account and preferences</p>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl"
        >
          {message}
        </motion.div>
      )}

      <div className="p-4">
        {/* Section Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveSection('account')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeSection === 'account' 
                ? 'bg-x-blue text-white' 
                : 'bg-gray-800 text-x-gray hover:text-white'
            }`}
          >
            <User size={18} />
            <span>Account</span>
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeSection === 'notifications' 
                ? 'bg-x-blue text-white' 
                : 'bg-gray-800 text-x-gray hover:text-white'
            }`}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeSection === 'privacy' 
                ? 'bg-x-blue text-white' 
                : 'bg-gray-800 text-x-gray hover:text-white'
            }`}
          >
            <Lock size={18} />
            <span>Privacy</span>
          </button>
          <button
            onClick={() => setActiveSection('appearance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeSection === 'appearance' 
                ? 'bg-x-blue text-white' 
                : 'bg-gray-800 text-x-gray hover:text-white'
            }`}
          >
            <Moon size={18} />
            <span>Appearance</span>
          </button>
        </div>

        {/* Account Settings */}
        {activeSection === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-x-gray mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-x-gray mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm text-x-gray mb-2">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-x-gray mt-1">Change username in Profile page</p>
                </div>

                <div>
                  <label className="block text-sm text-x-gray mb-2">Member Since</label>
                  <input
                    type="text"
                    value={new Date(profile?.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                    disabled
                    className="w-full px-4 py-3 bg-black border border-x-border rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="border border-red-500/20 rounded-2xl p-5 bg-red-500/5">
              <h3 className="font-bold mb-2 text-red-400">Danger Zone</h3>
              <p className="text-sm text-x-gray mb-4">Permanent actions that cannot be undone</p>
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition font-semibold flex items-center justify-center space-x-2"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Notification Settings */}
        {activeSection === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <ToggleSetting
                  label="Email Notifications"
                  description="Receive notifications via email"
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                />
                <ToggleSetting
                  label="Circle Invites"
                  description="Get notified when someone invites you to a circle"
                  enabled={circleInvites}
                  onChange={setCircleInvites}
                />
                <ToggleSetting
                  label="Activity Updates"
                  description="Weekly summary of your activity and progress"
                  enabled={activityUpdates}
                  onChange={setActivityUpdates}
                />
              </div>
            </div>

            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <ToggleSetting
                  label="Push Notifications"
                  description="Receive notifications in your browser"
                  enabled={pushNotifications}
                  onChange={(val) => {
                    if (val) {
                      requestNotificationPermission();
                    } else {
                      setPushNotifications(false);
                    }
                  }}
                />
                <p className="text-xs text-x-gray">
                  {Notification.permission === 'granted' 
                    ? '✓ Notifications are enabled in your browser' 
                    : '✗ Enable browser notifications to receive push notifications'}
                </p>
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full px-4 py-3 bg-x-blue text-white rounded-xl hover:bg-blue-600 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Profile Privacy</h3>
              <div className="space-y-4">
                <ToggleSetting
                  label="Public Profile"
                  description="Make your profile visible to other users"
                  enabled={publicProfile}
                  onChange={setPublicProfile}
                />
              </div>
            </div>

            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Data & Privacy</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-x-border">
                  <div>
                    <p className="font-semibold text-sm">Download Your Data</p>
                    <p className="text-xs text-x-gray">Export all your sessions and data</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm">
                    Export
                  </button>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-semibold text-sm text-red-400">Delete Account</p>
                    <p className="text-xs text-x-gray">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full px-4 py-3 bg-x-blue text-white rounded-xl hover:bg-blue-600 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* Appearance Settings */}
        {activeSection === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                    theme === 'dark' 
                      ? 'border-x-blue bg-x-blue/10' 
                      : 'border-x-border bg-black hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Moon size={20} />
                    <span>Dark</span>
                  </div>
                  {theme === 'dark' && <Check size={18} className="text-x-blue" />}
                </button>

                <button
                  onClick={() => setTheme('light')}
                  disabled
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-x-border bg-black opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <Sun size={20} />
                    <span>Light</span>
                  </div>
                  <span className="text-xs text-x-gray">Coming Soon</span>
                </button>
              </div>
            </div>

            <div className="border border-x-border rounded-2xl p-5 bg-gray-900/30">
              <h3 className="font-bold mb-4">Language</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-x-border rounded-xl focus:outline-none focus:border-x-blue transition"
              >
                <option value="en">English</option>
                <option value="es" disabled>Spanish (Coming Soon)</option>
                <option value="fr" disabled>French (Coming Soon)</option>
                <option value="de" disabled>German (Coming Soon)</option>
              </select>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full px-4 py-3 bg-x-blue text-white rounded-xl hover:bg-blue-600 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Toggle Setting Component
const ToggleSetting = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-x-border last:border-0">
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-x-gray mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition ${
          enabled ? 'bg-x-blue' : 'bg-gray-700'
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
          animate={{ left: enabled ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

export default Settings;
