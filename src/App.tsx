/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { BrowseView } from './components/BrowseView';
import { HostelDetailsView } from './components/HostelDetailsView';
import { StudentDashboard } from './components/StudentDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DBService } from './services/dbModule';
import { ShieldCheck, Calendar, Info, Heart, Mail, Phone, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ApplicationContent() {
  const { user, loading } = useAuth();
  
  // Custom router state tracking
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState<any>(null);

  // Initialize DB data once
  useEffect(() => {
    DBService.initialize();

    // Listen to hash changes if users use back buttons
    const handleHashCheck = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const parts = hash.split('?');
        const view = parts[0];
        setCurrentView(view);
      }
    };
    
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleNavigate = (view: string, params: any = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    setViewParams(params);
    // Sync window hash for deep navigation context
    window.location.hash = view;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl scale-110 animate-bounce">
          K
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-slate-900 text-sm">Synchronizing Kabarak Database...</h3>
          <p className="text-xs text-slate-400">Verifying biometric security tokens & active sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navbar Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Container Core Router */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'home' && (
              <HomeView onNavigate={handleNavigate} />
            )}

            {currentView === 'browse' && (
              <BrowseView initialParams={viewParams} onNavigate={handleNavigate} />
            )}

            {currentView === 'hostel-details' && (
              <HostelDetailsView params={viewParams} onNavigate={handleNavigate} />
            )}

            {currentView === 'student-dashboard' && (
              <StudentDashboard onNavigate={handleNavigate} />
            )}

            {currentView === 'manager-dashboard' && (
              <ManagerDashboard onNavigate={handleNavigate} />
            )}

            {currentView === 'admin-dashboard' && (
              <AdminDashboard />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern, high-security university footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 font-sans mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-900">
            {/* Left Brand info (col 5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold font-sans text-sm">
                  K
                </div>
                <span className="font-bold text-white text-base tracking-tight select-none">
                  KABU Student Housing
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Official online reservation bureau for Kabarak University residence halls and registered off-campus apartments. Built under Christian foundation rules, guaranteeing 100% student safety, constant security guards, quiet study indices.
              </p>
            </div>

            {/* Quick Links (col 3) */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Accommodation Links
              </h5>
              <div className="flex flex-col space-y-2 text-xs font-medium">
                <button 
                  onClick={() => handleNavigate('browse')}
                  className="text-left hover:text-white hover:underline transition-colors leading-none"
                >
                  Browse verified rooms
                </button>
                <button 
                  onClick={() => handleNavigate('student-dashboard')}
                  className="text-left hover:text-white hover:underline transition-colors leading-none"
                >
                  My bookings dashboard
                </button>
                <button 
                  onClick={() => handleNavigate('manager-dashboard')}
                  className="text-left hover:text-white hover:underline transition-colors leading-none"
                >
                  Hostel manager portal
                </button>
              </div>
            </div>

            {/* Contact info (col 4) */}
            <div className="md:col-span-4 space-y-3 text-xs leading-none">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Information & support Office
              </h5>
              <div className="space-y-2 font-sans font-medium text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" /> accommodations@kabarak.ac.ke
                </p>
                <p className="flex items-center gap-1.5 pt-1">
                  <Phone className="w-4 h-4 text-indigo-500 shrink-0" /> +254 700 KABARAK (522272)
                </p>
                <p className="pt-2 text-[10px] text-slate-500 font-mono italic leading-normal">
                  Location: Nakuru-Eldama Ravine Hwy, Nakuru County, Kenya
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-sans">
            <p>
              &copy; {new Date().getFullYear()} Kabarak University. Integrated Hostels Allocations System &middot; All Rights Reserved.
            </p>
            <div className="flex gap-4 pt-1 sm:pt-0">
              <span className="hover:text-slate-400 cursor-pointer">Security Code Cleared</span>
              <span>&bull;</span>
              <span className="hover:text-slate-400 cursor-pointer">Education Act Standards Compliant</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ApplicationContent />
    </AuthProvider>
  );
}
