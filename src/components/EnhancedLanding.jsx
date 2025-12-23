import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

export const EnhancedLanding = ({ onGetStarted }) => {
  const handleClick = () => {
    console.log('🔵 Button clicked!');
    console.log('🔵 onGetStarted function:', onGetStarted);
    if (onGetStarted) {
      console.log('🔵 Calling onGetStarted...');
      onGetStarted();
      console.log('🔵 onGetStarted called!');
    } else {
      console.error('❌ onGetStarted is undefined!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-4xl px-6">
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-8">
          <div className="h-24 w-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <Zap size={48} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            GoonSync
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Sync sessions, earn XP, compete with friends.
          <br />
          <span className="text-gray-400">The ultimate social sync platform.</span>
        </p>

        {/* Test Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleClick}
            className="w-full max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl"
          >
            Get Started
          </button>

          <button
            onClick={handleClick}
            className="w-full max-w-md mx-auto block px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl flex items-center justify-center"
          >
            Start Free <ArrowRight className="ml-2" size={20} />
          </button>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl text-left text-sm">
            <p className="text-gray-400 mb-2">Debug Info:</p>
            <p className="text-white">onGetStarted prop: {onGetStarted ? '✅ Passed' : '❌ Missing'}</p>
            <p className="text-gray-400 text-xs mt-2">Open browser console (F12) and click the buttons to see logs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
