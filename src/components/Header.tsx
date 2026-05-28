/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Building, LogIn, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'student', label: 'Student Portal', icon: User, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { role: 'manager', label: 'Hostel Manager', icon: Building, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { role: 'admin', label: 'Super Admin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="font-sans font-bold text-lg tracking-tight">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                KABU Hostels
              </h1>
              <span className="text-[10px] font-medium uppercase tracking-widest text-indigo-600 font-mono">
                Kabarak University
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 font-sans text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                currentView === 'home' 
                  ? 'text-indigo-700 bg-indigo-50/50' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                currentView === 'browse' 
                  ? 'text-indigo-700 bg-indigo-50/50' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Browse Rooms
            </button>
            
            {user?.role === 'student' && (
              <button
                onClick={() => onNavigate('student-dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                  currentView === 'student-dashboard' 
                    ? 'text-indigo-700 bg-indigo-50/50' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                My Bookings
              </button>
            )}

            {user?.role === 'manager' && (
              <button
                onClick={() => onNavigate('manager-dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                  currentView === 'manager-dashboard' 
                    ? 'text-emerald-700 bg-emerald-50/50' 
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Manager Panel
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                  currentView === 'admin-dashboard' 
                    ? 'text-purple-700 bg-purple-50/50' 
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                Admin Control
              </button>
            )}
          </nav>

          {/* User Section & Role Switcher HUD */}
          <div className="flex items-center space-x-3">
            {/* Simulation HUD Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 transition-colors shadow-2xs"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <span className="hidden sm:inline">Role:</span>
                <span className="capitalize">{user?.role}</span>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500 ml-0.5" />
              </button>

              {/* Persona Switch Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 px-3 z-50">
                  <div className="px-2 pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Switch Active Persona
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Instantly change perspectives to test complete workflows!
                    </p>
                  </div>
                  <div className="space-y-1">
                    {roles.map(r => {
                      const Icon = r.icon;
                      const isActive = user?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left text-xs font-semibold transition-all ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`p-1 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="leading-none">{r.label}</p>
                            <span className={`text-[9px] font-medium leading-none ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                              {r.role === 'student' ? 'Sharon Jemutai (Resident)' : r.role === 'manager' ? 'Alice Chebet (Manager)' : 'Platform Owner'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
                    <button 
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                    <span className="text-slate-400 font-mono text-[9px] self-center">Mock Session</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Summary */}
            <div 
              onClick={() => {
                if (user?.role === 'student') onNavigate('student-dashboard');
                else if (user?.role === 'manager') onNavigate('manager-dashboard');
                else onNavigate('admin-dashboard');
              }}
              className="flex items-center space-x-2 cursor-pointer pl-1 hover:opacity-90 transition-opacity"
            >
              <img
                src={user?.profileData?.profilePhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-indigo-100 shadow-2xs object-cover"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.displayName.split(' ')[0]}
                </p>
                <p className="text-[10px] font-medium text-slate-400 leading-none">
                  {user?.role === 'student' ? 'Student' : user?.role === 'manager' ? 'Manager' : 'Admin'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
