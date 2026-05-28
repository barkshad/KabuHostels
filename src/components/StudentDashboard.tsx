/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Booking, Hostel, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  User, BookOpen, Clock, Calendar, CheckCircle, AlertTriangle, ShieldCheck, 
  MapPin, Heart, Phone, ArrowRight, Save, Edit, RefreshCw, Star 
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, updateStudent } = useAuth();
  
  const [studentBookings, setStudentBookings] = useState<Booking[]>([]);
  const [wishedHostels, setWishedHostels] = useState<Hostel[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Edit Profile Inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('3rd');

  const refreshData = () => {
    if (!user) return;
    
    // Get Bookings for student
    const allBookings = DBService.getBookings();
    const filtered = allBookings.filter(b => b.studentId === user.uid);
    setStudentBookings(filtered);

    // Initial Profile Inputs
    if (user.profileData) {
      setFullName(user.profileData.fullName);
      setPhone(user.profileData.phone);
      setCourse(user.profileData.course || 'BSc. Computer Science');
      setYear(user.profileData.year || '3rd');
    }

    // Load wished hostels (use first 2 hostels as default wishlist for instant beauty)
    const allHostels = DBService.getHostels();
    setWishedHostels(allHostels.slice(0, 2));
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent({
      fullName,
      phone,
      course,
      year: year as any
    });
    setIsEditingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  const handleCancelBooking = (bookingId: string) => {
    const bk = DBService.getBookingById(bookingId);
    if (!bk) return;
    
    if (confirm('Are you sure you want to cancel this room placement ticket? The room inventory will be instantly returned to the active collection.')) {
      DBService.saveBooking({
        ...bk,
        status: 'cancelled'
      });
      refreshData();
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const classes: Record<Booking['status'], string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-250',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-250',
      'checked-in': 'bg-indigo-100 text-indigo-700 border-indigo-250',
      'checked-out': 'bg-slate-100 text-slate-500 border-slate-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${classes[status] || 'bg-slate-50'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* 1. Header welcome banner */}
      <div className="bg-gradient-to-tr from-[#1e1b4b] to-[#312e81] text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-amber-400 text-indigo-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono">
              Verified Student Profile
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Hello, {fullName ? fullName.split(' ')[0] : 'Sharon'}!
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-indigo-200 font-sans">
              <p className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {course} ({year} Year)
              </p>
              <p>&bull;</p>
              <p className="font-mono">ID: {user?.profileData?.studentId || 'CS/M/1045/09/23'}</p>
            </div>
          </div>

          <div className="flex gap-2 self-start md:self-center">
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" /> Edit Profile parameters
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary block editable profiles */}
      {isEditingProfile && (
        <form onSubmit={handleProfileSave} className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800">Edit Student Registration Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Mobile Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Degree Course Major</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-805"
              >
                <option value="1st">1st Year (Fresher)</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="text-slate-500 font-bold hover:underline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-2xs transition-all flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" /> Commit Changes
            </button>
          </div>
        </form>
      )}

      {profileSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl p-3.5 max-w-xl">
          Profile configurations synced successfully. Sessions refreshed!
        </div>
      )}

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active room tickets - Left Part (col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Active Placement Tickets
            </h3>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              CURRENT SEMESTER: JAN-APRIL 2026
            </span>
          </div>

          {studentBookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto rounded-full">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Reserved Room Spaces</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not hold any active accommodation assignments. Visit the room catalog to secure a room space.
                </p>
              </div>
              <button
                onClick={() => onNavigate('browse')}
                className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-2xs"
              >
                Browse verified rooms
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {studentBookings.map(b => {
                const hostel = DBService.getHostelById(b.hostelId);
                if (!hostel) return null;

                const isPendingOrConfirmed = b.status === 'pending' || b.status === 'confirmed';

                return (
                  <div key={b.id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-2xs flex flex-col sm:flex-row">
                    
                    {/* Media */}
                    <div className="sm:w-56 aspect-video sm:aspect-auto sm:h-auto bg-slate-100 relative shrink-0">
                      <img 
                        src={hostel.media[0]?.secure_url} 
                        alt="Hostel view" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content details */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wide font-bold text-indigo-600 font-mono">
                            REF NO: {b.id}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{hostel.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-0.5 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {hostel.location}
                        </p>
                        <p className="text-xs font-sans font-bold text-slate-700">
                          Assigned Room space: <span className="text-indigo-600 font-mono">{b.roomNumber}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-150 grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 leading-none">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Check-in</span>
                          <span className="text-slate-800 font-mono text-[11px]">{b.checkInDate}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration context</span>
                          <span className="text-slate-800 font-mono text-[11px]">{b.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-405 font-mono">Alloc Cost</span>
                          <p className="font-sans font-bold text-slate-900 text-xs">
                            KES {b.totalPrice.toLocaleString()}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {isPendingOrConfirmed && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3.5 py-1.8 rounded-lg transition-all"
                            >
                              Cancel Allocation
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('hostel-details', { hostelId: hostel.id })}
                            className="bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs px-3.5 py-1.8 rounded-lg transition-all"
                          >
                            Inspection profile
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wishlists sidebar - Right Part (col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Saved Favourites
            </h3>
          </div>

          <div className="space-y-4">
            {wishedHostels.map(h => {
              const reviews = DBService.getReviewsForHostel(h.id);
              const avg = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '4.8';

              return (
                <div 
                  key={h.id}
                  onClick={() => onNavigate('hostel-details', { hostelId: h.id })}
                  className="bg-white border border-slate-150 rounded-xl p-3 flex gap-3 cursor-pointer group hover:shadow-md transition-shadow"
                >
                  <div className="w-20 aspect-square rounded-lg overflow-hidden bg-slate-105 shrink-0">
                    <img src={h.media[0]?.secure_url} alt={h.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">
                        {h.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-0.5 font-sans pt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" /> {h.location.split(',')[0]}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold font-sans text-slate-800 leading-none">
                        KES {h.price.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-500" /> {avg}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Proactive tip widget */}
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-4.5 space-y-1.5 text-xs">
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 shrink-0" /> Placement Guarantee
            </span>
            <p className="leading-relaxed font-sans text-indigo-950">
              All listed options hold certified fire-safety clearances, biometric perimeter rules, and constant warden supervisors.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
