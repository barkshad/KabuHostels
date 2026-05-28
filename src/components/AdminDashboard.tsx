/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Manager, Hostel, Category, SiteSettings, Booking } from '../types';
import { 
  ShieldCheck, Users, Building, Settings, List, Image, AlertOctagon, RefreshCw, 
  Trash2, Check, X, Star, Save, ShieldAlert, DollarSign, Activity, FileText 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DBService.getSettings());
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Subtab navigation console
  const [activeTab, setActiveTab] = useState<'overview' | 'managers' | 'properties' | 'categories' | 'settings' | 'seed'>('overview');

  // New Category inline inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  
  // Settings Inputs
  const [platformName, setPlatformName] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState(5);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const refreshData = () => {
    DBService.initialize();
    setManagers(DBService.getManagers());
    setHostels(DBService.getHostels());
    setCategories(DBService.getCategories());
    setBookings(DBService.getBookings());

    const currentSettings = DBService.getSettings();
    setSettings(currentSettings);
    
    setPlatformName(currentSettings.platformName);
    setHeroTitle(currentSettings.heroTitle);
    setHeroSubtitle(currentSettings.heroSubtitle);
    setHeroImage(currentSettings.heroImage);
    setContactEmail(currentSettings.contactEmail);
    setSupportPhone(currentSettings.supportPhone);
    setCommissionRate(currentSettings.commissionRate);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync Manager verification status
  const handleManagerVerification = (managerId: string, status: Manager['verificationStatus']) => {
    const mgr = DBService.getManagerById(managerId);
    if (!mgr) return;

    DBService.saveManager({
      ...mgr,
      verificationStatus: status,
      isActive: status === 'verified'
    });

    refreshData();
    alert(`Manager ${mgr.name} successfully updated to verify state: ${status.toUpperCase()}`);
  };

  // Toggle hostel Featured status
  const handleToggleFeatured = (hostelId: string) => {
    const currentSettings = DBService.getSettings();
    let featuredList = [...currentSettings.featuredHostelIds];

    if (featuredList.includes(hostelId)) {
      featuredList = featuredList.filter(id => id !== hostelId);
    } else {
      featuredList.push(hostelId);
    }

    const updatedSettings = { ...currentSettings, featuredHostelIds: featuredList };
    DBService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    alert('Homepage featured hostel selections synced dynamically!');
  };

  // Categories addition
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newCatDesc,
      isActive: true,
      order: categories.length + 1
    };

    DBService.saveCategory(newCat);
    setNewCatName('');
    setNewCatDesc('');
    refreshData();
    alert('Hostel category block inserted!');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this hostel category? Any hostel using this category might default back.')) {
      DBService.deleteCategory(id);
      refreshData();
    }
  };

  // Save Settings Form
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      platformName,
      heroTitle,
      heroSubtitle,
      heroImage,
      contactEmail,
      supportPhone,
      commissionRate: Number(commissionRate)
    };

    DBService.saveSettings(updated);
    setSettings(updated);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 4500);
  };

  // Utilities Reset
  const handleSystemRestore = () => {
    if (confirm('WIPE ALL LIVE MODIFICATIONS and restore deep-seeded Kabarak University hostel listings? Bookings, custom hostels, and messages will revert.')) {
      DBService.resetToDefault();
      refreshData();
      alert('Local database successfully reset to default certified blueprints!');
    }
  };

  const handleSystemWipe = () => {
    if (confirm('CRITICAL WARPING: Delete all active student, manager, and hostel records to inspect first-time onboarding? This action is irreversible.')) {
      DBService.clearAll();
      refreshData();
      alert('Database collections recursively swept empty!');
    }
  };

  // Aggregating Admin Statistics
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length;
  const aggregateRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);
  const managerCount = managers.length;
  const hostelCount = hostels.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* 1. Header welcome */}
      <div className="pb-4 border-b border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider font-mono">Platform Operator HUD</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-purple-600 shrink-0" /> Portal SuperAdmin
          </h2>
          <p className="text-slate-500 text-sm">
            Managing global configurations, verification flows, and operational database seeding.
          </p>
        </div>

        {/* Tab List */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto self-start">
          {[
            { id: 'overview', label: 'System Overview', icon: Activity },
            { id: 'managers', label: 'Warden Approvals', icon: Users },
            { id: 'properties', label: 'Hostel Feature', icon: Building },
            { id: 'categories', label: 'Room Categories', icon: List },
            { id: 'settings', label: 'Platform Settings', icon: Settings },
            { id: 'seed', label: 'Data Recovery Seeder', icon: RefreshCw },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === t.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT: SYSTEM DATA OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Verified Managers</span>
                <p className="text-2xl font-extrabold text-slate-900 font-sans">{managerCount}</p>
              </div>
              <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Listed Hostels</span>
                <p className="text-2xl font-extrabold text-slate-900 font-sans">{hostelCount}</p>
              </div>
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Overall Occupations</span>
                <p className="text-2xl font-extrabold text-[#059669] font-sans">{activeBookingsCount}</p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total System Collections</span>
                <p className="text-2xl font-extrabold text-purple-700 font-mono">KES {aggregateRevenue.toLocaleString()}</p>
              </div>
              <div className="w-11 h-11 bg-purple-55 text-purple-700 rounded-xl flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">System Integrity Checklist</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans text-xs text-slate-650">
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">1. Verification Audits</p>
                <p className="leading-normal pt-1">All newly registered hostel wardens go to the Warden Approvals workflow. Unverified hostels are hidden until verified.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">2. Commission Parameters</p>
                <p className="leading-normal pt-1">Settings parameters control platform-wide charges. Currently configured at a default index of {settings.commissionRate}% per allocation.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">3. Media Optimization</p>
                <p className="leading-normal pt-1">Platform images use drag-and-drop simulated compression, optimizing from 5MB files down to 200KB transparent vectors.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: WARDEN APPROVALS */}
      {activeTab === 'managers' && (
        <div className="space-y-4 font-sans">
          <h3 className="text-sm font-bold text-slate-800">Warden Registration approvals list</h3>
          <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="p-4 text-[10px] leading-none">Representative Name</th>
                  <th className="p-4 text-[10px] leading-none">Contact Phone</th>
                  <th className="p-4 text-[10px] leading-none">Managed Hostels Portfolio</th>
                  <th className="p-4 text-[10px] leading-none">Licences/Business bio</th>
                  <th className="p-4 text-[10px] leading-none">Approval Status</th>
                  <th className="p-4 text-[10px] leading-none text-center">Verification Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managers.map(m => {
                  const isVerified = m.verificationStatus === 'verified';
                  const isPending = m.verificationStatus === 'pending';
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img src={m.profilePhotoURL} alt="Warden avatar" className="w-8 h-8 rounded-full shadow-3xs" />
                          <div>
                            <p className="font-bold text-slate-800">{m.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-500 font-mono">{m.phone}</td>
                      <td className="p-4 font-bold text-slate-800">{m.hostelName}</td>
                      <td className="p-4 max-w-sm font-normal text-slate-500 line-clamp-2 pt-5">{m.businessDetails}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {m.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 flex gap-1 justify-center">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleManagerVerification(m.id, 'verified')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 rounded text-[10px] leading-none text-white block"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleManagerVerification(m.id, 'rejected')}
                              className="bg-rose-50 border border-rose-250 text-rose-600 hover:bg-rose-100 font-bold p-1 rounded text-[10px] leading-none block"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isVerified && (
                          <button
                            onClick={() => handleManagerVerification(m.id, 'rejected')}
                            className="text-[10px] font-bold text-rose-600 hover:underline"
                          >
                            Deactivate Account
                          </button>
                        )}

                        {m.verificationStatus === 'rejected' && (
                          <button
                            onClick={() => handleManagerVerification(m.id, 'verified')}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            Restore Account
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: FEATURE PROPERTIES */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Global Hostels Inventory & Feature Coordinator</h3>
          <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-2xs text-xs font-sans">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="p-4 text-[10px] leading-none">Property Name</th>
                  <th className="p-4 text-[10px] leading-none">Category type</th>
                  <th className="p-4 text-[10px] leading-none">Physical campus location</th>
                  <th className="p-4 text-[10px] leading-none">Rate semester</th>
                  <th className="p-4 text-[10px] leading-none">Capacity Status</th>
                  <th className="p-4 text-[10px] leading-none text-center">Featured status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hostels.map(h => {
                  const isFeatured = settings.featuredHostelIds.includes(h.id);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{h.name}</td>
                      <td className="p-4 font-medium text-slate-400">
                        {categories.find(c => c.id === h.categoryId)?.name || 'General Residence'}
                      </td>
                      <td className="p-4 font-normal text-slate-500">{h.location}</td>
                      <td className="p-4 font-bold text-slate-800 font-mono">KES {h.price.toLocaleString()}</td>
                      <td className="p-4 font-bold font-mono text-slate-600">
                        {h.availableRooms}/{h.capacity} free
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(h.id)}
                          className={`font-semibold text-[10px] py-1 px-2.5 rounded-lg border transition-all ${
                            isFeatured 
                              ? 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-3xs' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isFeatured ? '★ Featured Pin' : '☆ Pin to Home'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: ROOM CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List of categories */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Listed Hostel residency blocks</h3>
            <div className="space-y-3 font-sans text-xs">
              {categories.map(c => (
                <div key={c.id} className="bg-white border rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <p className="text-slate-500 pt-0.5 line-clamp-1">{c.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">SLUG: {c.slug}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-rose-600 hover:text-white p-1 rounded hover:bg-rose-550 border border-slate-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Create Categories */}
          <form onSubmit={handleAddCategory} className="lg:col-span-5 bg-slate-50 border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-slate-805 text-sm">Add residential category type</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category block Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Master Graduates Block"
                className="w-full bg-white border border-slate-200 rounded-xl p-2 px-3 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Overview description</label>
              <textarea
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Describe guidelines, allocation rules..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-slate-900 border text-white font-bold text-xs py-2 px-4 rounded-xl shadow-3xs w-full flex items-center justify-center gap-1"
            >
              Confirm Category Insertion
            </button>
          </form>
        </div>
      )}

      {/* 6. TAB CONTENT: SITE CONFIGURATION SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSettingsSave} className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 max-w-2xl space-y-5 shadow-3xs font-sans text-xs">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Custom site Branding & Configurations</h3>
            <p className="text-[11px] text-slate-400">Edit hero titles, image CDN headers and commission parameters.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Platform Name</label>
              <input
                type="text"
                required
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Home Hero Title</label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Home Hero Subtitle</label>
              <textarea
                required
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Hero Background image URL</label>
              <input
                type="text"
                required
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Warden Commission rate (%)</label>
                <input
                  type="number"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-slate-850 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">University support email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-slate-850 focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            {settingsSuccess && (
              <span className="text-[11px] font-bold text-emerald-650 self-center mr-auto">Settings configurations updated successfully!</span>
            )}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-1 shrink-0"
            >
              <Save className="w-4 h-4" /> Save branding configurations
            </button>
          </div>
        </form>
      )}

      {/* 7. TAB CONTENT: LOCAL RECOVERY DATA SEEDER */}
      {activeTab === 'seed' && (
        <div className="bg-slate-50 border rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl font-sans text-xs">
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-orange-600" /> Data Recovery Seeder Console
            </h3>
            <p className="text-xs text-slate-505 leading-relaxed">
              If local database states become inconsistent, overwritten, or depleted of verified hostels during testing, this console allows instant restorative recovery of standard initial mock data collections into `localStorage`.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seed Recover Card */}
            <div className="bg-white border rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-805 text-sm flex items-center gap-1 leading-none">
                  <RefreshCw className="w-4 h-4 text-indigo-600" /> Restore certified demo values
                </p>
                <p className="text-slate-450 text-[11px] leading-relaxed pt-1 font-sans">
                  Instantly populates 5 certified hostels in Nakuru, 3 warden managers, 1 computer science student, default verified reviews, and support contact settings.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSystemRestore}
                className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-3xs w-full block transition-colors leading-none"
              >
                Re-Seed Default Demo Data
              </button>
            </div>

            {/* Sweep Wipe Card */}
            <div className="bg-white border rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-805 text-sm flex items-center gap-1 leading-none">
                  <Trash2 className="w-4 h-4 text-rose-600" /> Wipe complete system databases
                </p>
                <p className="text-slate-450 text-[11px] leading-relaxed pt-1 font-sans">
                  Clears all categories, hostels, registered accounts and booking transactions. Useful to inspect empty state onboarding workflows.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSystemWipe}
                className="bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 text-rose-600 font-bold text-xs py-2 px-4 rounded-xl shadow-3xs w-full block transition-colors leading-none"
              >
                Deallocate All Records
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
