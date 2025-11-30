import React from 'react';
import { Home, Users, Zap, User, Settings, LogOut } from 'lucide-react';

const MainLayout = ({ children, currentView, setView, profile, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'circles', label: 'Circles', icon: Users },
    { id: 'syncs', label: 'Syncs', icon: Zap },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Left Sidebar */}
        <div className="w-[275px] fixed h-screen border-r border-x-border px-4 py-2 flex flex-col">
          {/* Logo */}
          <div className="px-3 py-4 mb-2">
            <h1 className="text-2xl font-bold">GoonSync</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full transition-all ${
                    isActive
                      ? 'bg-white text-black font-bold'
                      : 'hover:bg-x-hover'
                  }`}
                >
                  <Icon size={26} />
                  <span className="text-xl">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto border-t border-x-border pt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-full hover:bg-x-hover transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">@{profile?.username}</p>
                </div>
              </div>
              <LogOut size={18} className="text-x-gray" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-[275px] border-r border-x-border">
          <div className="max-w-[600px] min-h-screen">
            {children}
          </div>
        </div>

        {/* Right Sidebar (Optional - can add suggestions here later) */}
        <div className="w-[350px] fixed right-0 h-screen p-4 hidden xl:block">
          <div className="sticky top-4">
            <div className="bg-x-hover rounded-2xl p-4 border border-x-border">
              <h3 className="font-bold text-xl mb-3">What's happening</h3>
              <p className="text-x-gray text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top Header */}
        <div className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-x-border z-50">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold">GoonSync</h1>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-14 pb-16">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full bg-black border-t border-x-border z-50">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex flex-col items-center p-2 ${
                    isActive ? 'text-x-blue' : 'text-x-gray'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
