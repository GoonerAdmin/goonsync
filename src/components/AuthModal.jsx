import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await onLogin(username, password);
      } else {
        await onSignup(username, password);
      }
      // Success - modal will close automatically when user state updates
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md pointer-events-auto"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />

              {/* Modal content */}
              <div className="relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>

                {/* Header */}
                <div className="p-8 pb-6">
                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Zap size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-center mb-2">
                    {isLoginMode ? 'Welcome Back!' : 'Get Started'}
                  </h2>
                  <p className="text-gray-400 text-center">
                    {isLoginMode ? 'Sign in to continue your journey' : 'Create your account in seconds'}
                  </p>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-8"
                    >
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl p-4 mb-4 text-sm">
                        <p className="font-medium">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pb-8">
                  <div className="space-y-4">
                    {/* Username field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={20} className="text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                          placeholder="Enter your username"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock size={20} className="text-gray-500" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                          minLength={6}
                        />
                      </div>
                      {!isLoginMode && (
                        <p className="text-xs text-gray-500 mt-2">
                          Must be at least 6 characters
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          <span>{isLoginMode ? 'Signing in...' : 'Creating account...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Toggle mode */}
                <div className="px-8 pb-8 border-t border-gray-800 pt-6">
                  <p className="text-center text-gray-400 text-sm">
                    {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
                    {' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                      {isLoginMode ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
