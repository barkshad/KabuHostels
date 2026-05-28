/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Hostel, Category } from '../types';
import { Search, MapPin, Grid, Map, Star, ArrowRight, SlidersHorizontal, Check, RefreshCw, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumVideoPlayer } from './PremiumVideoPlayer';

interface BrowseViewProps {
  initialParams?: {
    query?: string;
    category?: string;
    maxPrice?: number;
  };
  onNavigate: (view: string, params?: any) => void;
}

const AMENITIES_LIST = [
  'High-speed Wi-Fi',
  'Hot Showers',
  'Laundry Rooms',
  'Biometric Security',
  'Study Desks & Chairs',
  'Purified Water Station',
  'Backup Generator',
  'Private Bathrooms & Hot Showers',
  'Kitchenette Space',
  'Recreation Room (Pool Table)',
  'Solar Power Backup',
  'Free Campus Morning/Evening Shuttle'
];

export const BrowseView: React.FC<BrowseViewProps> = ({ initialParams, onNavigate }) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialParams?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(initialParams?.category || '');
  const [priceRange, setPriceRange] = useState<number>(initialParams?.maxPrice || 35000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'availability' | 'name'>('name');
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [hoveredHostelId, setHoveredHostelId] = useState<string | null>(null);
  const [selectedMapHostel, setSelectedMapHostel] = useState<Hostel | null>(null);

  useEffect(() => {
    setHostels(DBService.getHostels().filter(h => h.status !== 'hidden'));
    setCategories(DBService.getCategories().filter(c => c.isActive));
  }, []);

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange(35000);
    setSelectedAmenities([]);
    setSortBy('name');
  };

  // Filter and Sort Logic
  const filteredHostels = hostels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? h.categoryId === selectedCategory : true;
    
    const matchesPrice = h.price <= priceRange;
    
    const matchesAmenities = selectedAmenities.length > 0 
      ? selectedAmenities.every(amenity => h.amenities.includes(amenity))
      : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesAmenities;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'availability') return b.availableRooms - a.availableRooms;
    return a.name.localeCompare(b.name);
  });

  // Default map selection to first hostel when map loads
  useEffect(() => {
    if (filteredHostels.length > 0 && !selectedMapHostel) {
      setSelectedMapHostel(filteredHostels[0]);
    }
  }, [viewMode, filteredHostels]);

  // Layout calculations for our stylized high-fidelity Map canvas
  // Scale lat/lon to map coordinates beautifully
  const getMapCoordinates = (lat: number, lon: number) => {
    // Kabarak ranges roughly: lat [-0.176, -0.166], lon [35.964, 35.975]
    const minLat = -0.1760;
    const maxLat = -0.1660;
    const minLon = 35.9640;
    const maxLon = 35.9750;

    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100; // Invert y because SVG 0 is top
    
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">Room Navigator</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Accommodation Catalog</h2>
          <p className="text-slate-500 text-sm">
            {filteredHostels.length} verified listings available matching preferences.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-3 self-start md:self-center">
          <div className="flex bg-slate-100 p-1.2 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Campus Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Browse Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Left Sidebar */}
        <section className="lg:col-span-3 bg-slate-50/50 border border-slate-150 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filter Criteria
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search text input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Eden Hall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category SELECTOR */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Residency Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-hidden font-sans text-slate-700 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Rental Cost Limit
              </label>
              <span className="font-bold text-indigo-700 font-mono text-xs">
                KES {priceRange.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="35000"
              step="500 font-mono"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono leading-none pt-1">
              <span>KES 10K</span>
              <span>KES 22.5K</span>
              <span>KES 35K</span>
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Desired Comforts
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {AMENITIES_LIST.map(a => {
                const checked = selectedAmenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAmenityToggle(a)}
                    className="w-full text-left flex items-center space-x-2.5 py-1 text-slate-650 hover:text-indigo-600 transition-colors"
                  >
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                      checked 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-3xs' 
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-sans leading-none">{a}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Controller */}
          <div className="space-y-2 pt-2 border-t border-slate-200/50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Sort Sequence
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-hidden font-sans text-slate-700 font-medium"
            >
              <option value="name">Alphabetical (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="availability">Available Rooms Count</option>
            </select>
          </div>
        </section>

        {/* Results Panels */}
        <section className="lg:col-span-9">
          {filteredHostels.length === 0 ? (
            <div className="text-center py-20 bg-slate-55 border border-dashed border-slate-200 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">No Listings Match Filters</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing your current filter configurations or adjusting your price slider range.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shrink-0"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* 1. Grid Results view */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHostels.map(h => {
                const isAvailable = h.availableRooms > 0;
                const reviews = DBService.getReviewsForHostel(h.id);
                const avg = reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '4.8';

                return (
                  <div
                    key={h.id}
                    onClick={() => onNavigate('hostel-details', { hostelId: h.id })}
                    onMouseEnter={() => setHoveredHostelId(h.id)}
                    onMouseLeave={() => setHoveredHostelId(null)}
                    className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col h-full"
                  >
                    <div className="relative aspect-video bg-slate-150 overflow-hidden">
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
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200 skeleton"
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
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200 skeleton"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-white/50 rounded-full px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider text-slate-800">
                        {categories.find(c => c.id === h.categoryId)?.name.split(" ")[0]}
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {isAvailable ? `${h.availableRooms} Available` : 'Full'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold h-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" /> {h.location.split(',')[0]}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {avg}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                          {h.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-snug font-sans line-clamp-2 h-8">
                          {h.description}
                        </p>
                      </div>

                      <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Semester Fee</span>
                          <p className="text-xs font-sans font-extrabold text-slate-800 leading-none">
                            KES {h.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 group-hover:underline inline-flex items-center gap-0.5 leading-none shrink-0 font-mono">
                          View details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Campus Map Visual schema view */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6">
              
              {/* Map Canvas - left-side (col 8) */}
              <div className="md:col-span-8 bg-slate-900 aspect-video rounded-2xl relative overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                
                {/* Visual grid markings for HUD aesthetic */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-800/50 z-0"></div>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-slate-800/50 z-0"></div>

                {/* Core landmark vectors */}
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center text-slate-700 pointer-events-none select-none z-10 space-y-1">
                  <div className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-widest text-[#facc15] font-mono leading-none">
                     University Chapel (Main Gate Landmark)
                  </div>
                  <div className="w-3.5 h-3.5 border border-dashed border-[#facc15] rounded-full mx-auto"></div>
                </div>

                <div className="absolute bottom-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-center text-slate-700 pointer-events-none select-none z-10 space-y-1">
                  <div className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono leading-none">
                    West Wing Block (Postgrad Block)
                  </div>
                  <div className="w-3.5 h-3.5 border border-dashed border-indigo-400 rounded-full mx-auto"></div>
                </div>

                <div className="absolute bottom-[20%] right-[25%] -translate-x-1/2 -translate-y-1/2 text-center text-slate-700 pointer-events-none select-none z-10 space-y-1">
                  <div className="px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono leading-none">
                    Rafiki Student Zone (Off-campus)
                  </div>
                  <div className="w-3.5 h-3.5 border border-dashed border-emerald-400 rounded-full mx-auto"></div>
                </div>

                {/* Plot glowing pins */}
                <div className="absolute inset-0 z-30">
                  {filteredHostels.map(h => {
                    const coords = getMapCoordinates(h.latitude, h.longitude);
                    const isSelected = selectedMapHostel?.id === h.id;

                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setSelectedMapHostel(h)}
                        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-30 flex flex-col items-center"
                      >
                        {/* Glowing Ring Pin */}
                        <div className="relative">
                          {isSelected && (
                            <span className="absolute -inset-2.2 rounded-full bg-indigo-500/40 animate-ping"></span>
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-lg transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 border-white text-white scale-120 z-40' 
                              : 'bg-white border-indigo-500 text-indigo-600 hover:scale-110 z-30'
                          }`}>
                            <MapPin className="w-4.5 h-4.4 shrink-0" />
                          </div>
                        </div>

                        {/* Text Label on Hover */}
                        <span className="absolute top-8 pointer-events-none roundedbg py-0.5 px-2 bg-slate-900 text-[8px] font-bold font-mono tracking-wide text-white border border-slate-800 transition-opacity duration-150 whitespace-nowrap opacity-100 block group-hover:opacity-100">
                          {h.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* HUD Coordinates Display bottom bar */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-2 py-1 rounded-md text-[9px] font-mono text-slate-400 leading-none z-40">
                  LAT: 0.1695° S &middot; LON: 35.9680° E &middot; ACCURACY: HIGH
                </div>
              </div>

              {/* Sidebar card of selected hostel - right-side (col 4) */}
              <div className="md:col-span-4 bg-white rounded-2xl p-5 border border-slate-150 shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
                    Selected Location
                  </h4>
                  {selectedMapHostel ? (
                    <div className="space-y-4 mt-3">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
                        <img 
                          src={selectedMapHostel.media[0]?.secure_url} 
                          alt={selectedMapHostel.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-900 text-sm">{selectedMapHostel.name}</h5>
                        <p className="text-xs text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {selectedMapHostel.location}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Amenities</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedMapHostel.amenities.slice(0, 3).map(a => (
                            <span key={a} className="px-2 py-0.5 roundedbg text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-100">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider0">Semester Rate</span>
                          <p className="font-sans font-bold text-slate-800 text-xs leading-none">
                            KES {selectedMapHostel.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onNavigate('hostel-details', { hostelId: selectedMapHostel.id })}
                          className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-0.5 shadow-2xs shrink-0"
                        >
                          Book Space <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-400 text-xs font-medium">
                      Select any map pin coordinates to inspect residential profiles.
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          )}
        </section>
      </div>

    </div>
  );
};
