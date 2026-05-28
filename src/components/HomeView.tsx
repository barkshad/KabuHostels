/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Hostel, SiteSettings, Category } from '../types';
import { Search, MapPin, Check, Star, ArrowRight, ShieldCheck, HelpCircle, Activity, Award, Sparkles, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { PremiumVideoPlayer } from './PremiumVideoPlayer';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<SiteSettings>(DBService.getSettings());
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [priceMax, setPriceMax] = useState('30000');
  const [hoveredHostelId, setHoveredHostelId] = useState<string | null>(null);

  useEffect(() => {
    setSettings(DBService.getSettings());
    setHostels(DBService.getHostels().filter(h => h.status !== 'hidden'));
    setCategories(DBService.getCategories().filter(c => c.isActive));
  }, []);

  const featuredHostels = hostels.filter(h => 
    settings.featuredHostelIds.includes(h.id)
  );

  const finalFeatured = featuredHostels.length > 0 ? featuredHostels : hostels.slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', {
      query: searchQuery,
      category: selectedCat,
      maxPrice: Number(priceMax)
    });
  };

  return (
    <div className="space-y-16 pb-20 animate-fade-in">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 text-white shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={settings.heroImage || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"} 
            alt="Kabarak Campus" 
            className="w-full h-full object-cover skeleton"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> 100% Student Verified Accomm
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white max-w-4xl mx-auto">
              {settings.heroTitle}
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans">
              {settings.heroSubtitle}
            </p>
          </motion.div>

          {/* Search HUD Console */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl sm:rounded-full p-2.5 shadow-xl border border-slate-100 flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto text-slate-800"
          >
            {/* Search Input */}
            <div className="flex-1 flex items-center px-4 space-x-2 border-b sm:border-b-0 sm:border-r border-slate-100 py-2 sm:py-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search hostel name, location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-hidden text-sm placeholder-slate-400 font-sans"
              />
            </div>

            {/* Category selection */}
            <div className="flex items-center px-4 border-b sm:border-b-0 sm:border-r border-slate-100 py-2 sm:py-0">
              <MapPin className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-transparent focus:outline-hidden text-xs font-semibold text-slate-700 cursor-pointer pr-3 py-1 font-sans"
              >
                <option value="">Any Hostel Type</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price Cap selector */}
            <div className="flex items-center px-4 py-2 sm:py-0 mr-1">
              <span className="text-xs font-semibold text-slate-400 mr-2 font-mono">Max KES:</span>
              <select
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="bg-transparent focus:outline-hidden text-xs font-bold text-slate-800 cursor-pointer py-1 font-mono"
              >
                <option value="15000">15,000 / Sem</option>
                <option value="18000">18,000 / Sem</option>
                <option value="20000">20,000 / Sem</option>
                <option value="30000">30,000 / Sem</option>
                <option value="50000">50,000 / Sem</option>
              </select>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </div>
      </section>

      {/* 2. Quick Category Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Hostel Categories</h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Choose your preferred residential style curated under Kabarak housing rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -5 }}
              onClick={() => onNavigate('browse', { category: c.id })}
              className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-150 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto font-bold text-lg font-mono">
                  0{i + 1}
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{c.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">{c.description}</p>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-4 inline-flex items-center gap-1 mx-auto hover:underline font-mono">
                Explore Rooms <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Featured Hostels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">Curated Inventory</span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Residences</h3>
            <p className="text-sm text-slate-500 max-w-lg">
              Verified physical properties on-campus and close by holding full Kabarak regulatory certificates.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('browse')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
          >
            All Hostels ({hostels.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {finalFeatured.map(h => {
            const reviewsForHostel = DBService.getReviewsForHostel(h.id);
            const avgRating = reviewsForHostel.length > 0 
              ? (reviewsForHostel.reduce((sum, r) => sum + r.rating, 0) / reviewsForHostel.length).toFixed(1)
              : '4.8'; // high default for seeded

            const isAvailable = h.availableRooms > 0;

            return (
              <div 
                key={h.id}
                onClick={() => onNavigate('hostel-details', { hostelId: h.id })}
                onMouseEnter={() => setHoveredHostelId(h.id)}
                onMouseLeave={() => setHoveredHostelId(null)}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col h-full"
              >
                {/* Media Section */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {h.media.find(m => m.resource_type === 'video') ? (
                    hoveredHostelId === h.id ? (
                      <PremiumVideoPlayer 
                        url={h.media.find(m => m.resource_type === 'video')!.secure_url} 
                        poster={h.media.find(m => m.resource_type === 'image')?.secure_url}
                        isHoverMode={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <img 
                          src={h.media.find(m => m.resource_type === 'image')?.secure_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"} 
                          alt={h.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 skeleton"
                          referrerPolicy="no-referrer"
                        />
                        {/* Glow badge overlay informing live video is available on hover */}
                        <div className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-black/75 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 text-[9px] font-bold tracking-widest font-mono uppercase rounded-xl flex items-center gap-1.5 shadow-lg">
                            <Play className="w-3.5 h-3.5 fill-white text-white animate-pulse" /> Live Preview
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <img 
                      src={h.media.find(m => m.resource_type === 'image')?.secure_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"} 
                      alt={h.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 skeleton"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Category tag */}
                  <div className="absolute top-4 left-4 pt-0.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-white/90 backdrop-blur-xs border border-white/40 shadow-2xs font-mono">
                      {categories.find(c => c.id === h.categoryId)?.name.split(" ")[0]}
                    </span>
                  </div>

                  {/* Status Overlay Tag */}
                  <div className="absolute top-4 right-4 pt-0.5 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isAvailable 
                        ? 'bg-emerald-500/90 text-white' 
                        : 'bg-rose-500/90 text-white'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-white'} ${isAvailable && 'animate-pulse'}`}></span>
                      {isAvailable ? `${h.availableRooms} Rooms Left` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {h.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {avgRating}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                      {h.name}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2 mt-2">
                      {h.description}
                    </p>

                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {h.amenities.slice(0, 3).map(a => (
                        <span key={a} className="px-2 py-0.5 roundedbg text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 font-sans">
                          {a}
                        </span>
                      ))}
                      {h.amenities.length > 3 && (
                        <span className="px-2 py-0.5 roundedbg text-[10px] font-semibold text-slate-400 bg-slate-50/50 border border-slate-100/50 font-sans">
                          +{h.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-4 mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Rates / Semester</span>
                      <p className="text-sm font-sans font-extrabold text-slate-900 leading-none">
                        KES {h.price.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 font-sans">/sem</span>
                      </p>
                    </div>

                    <button 
                      className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 transition-all ${
                        isAvailable 
                          ? 'bg-slate-900 text-white hover:bg-indigo-600' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!isAvailable}
                    >
                      {isAvailable ? 'Book Space' : 'Awaiting Alloc'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">Frictionless Workflow</span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">How KABU Hostels Works</h3>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Secure university physical housing in three direct steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100/80 shadow-2xs relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold font-mono">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Explore & Discover</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Browse student residency categories, filters prices, location, and verified amenities with full real photo arrays.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100/80 shadow-2xs relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold font-mono">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Request Allocation</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Create a student portal ID profile, select room preferences, supply check dates, and submit booking requests directly to verified wardens.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100/80 shadow-2xs relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold font-mono">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Secure & Move In</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Upon warden approval, confirm allocation, arrange payment conditions, download verification receipts, and proceed straight to check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Values or Certifications banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl shadow-indigo-150">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-400 blur-3xl -top-40 -left-40"></div>
            <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500 blur-3xl -bottom-40 -right-40"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 border border-amber-400/10 font-mono">
                Kabarak Hostels Gaurantee
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Are You a Certified Property Manager?
              </h3>
              <p className="text-sm text-indigo-200 font-sans max-w-xl">
                Register as a certified accommodation agent under the Kabarak University super admin portal. Post room inventories, automate bookings, and manage occupancy analytics instantly.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 justify-center lg:justify-end shrink-0">
              <button 
                onClick={() => onNavigate('browse')}
                className="bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl border border-indigo-700 transition-colors"
              >
                Browse Catalog
              </button>
              <button 
                onClick={() => {
                  DBService.setActiveRole('manager', 'mgr-alice');
                  onNavigate('manager-dashboard');
                }}
                className="bg-amber-400 hover:bg-amber-500 text-indigo-950 text-xs font-bold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-300/20"
              >
                Become a Manager <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">Student Voices</span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Loved by Kabarak Students</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            What your fellow peers say about their booking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DBService.getReviews().slice(0, 2).map((r, i) => (
            <div key={r.id} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className={`w-4 h-4 ${idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-sans italic">
                  "{r.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-150 border border-white flex items-center justify-center font-bold text-indigo-700 text-sm">
                  {r.studentName.charAt(0)}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{r.studentName}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">Resident &middot; {r.createdAt.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
