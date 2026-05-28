/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Hostel, Category, Review, Booking, InquiryMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Star, Calendar, MessageSquare, AlertCircle, Phone, Sparkles, Check, 
  ArrowLeft, Heart, Shield, Clock, Info, Loader2, Send, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HostelDetailsViewProps {
  params: { hostelId: string };
  onNavigate: (view: string, params?: any) => void;
}

export const HostelDetailsView: React.FC<HostelDetailsViewProps> = ({ params, onNavigate }) => {
  const { hostelId } = params;
  const { user } = useAuth();
  
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWished, setIsWished] = useState(false);
  const [activePhoto, setActivePhoto] = useState('');
  
  // Booking Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [duration, setDuration] = useState('One Semester');
  const [checkInDate, setCheckInDate] = useState('2026-09-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-12-15');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Inquiry Form State
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const data = DBService.getHostelById(hostelId);
    if (data) {
      setHostel(data);
      if (data.media.length > 0) {
        setActivePhoto(data.media[0].secure_url);
      }
      const cats = DBService.getCategories();
      const catObj = cats.find(c => c.id === data.categoryId);
      if (catObj) setCategory(catObj);
      
      const revs = DBService.getReviewsForHostel(hostelId);
      setReviews(revs);
    }
  }, [hostelId, reviewSuccess]);

  if (!hostel) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <h3 className="font-bold text-slate-850">Analyzing Property Details...</h3>
        <button onClick={() => onNavigate('browse')} className="text-sm font-bold text-indigo-600 hover:underline">
          Return to Browse
        </button>
      </div>
    );
  }

  // Generate some realistic available mock room numbers based on capacity
  const mockRooms = Array.from({ length: 4 }, (_, i) => `${hostel.name.charAt(0)}${200 + i * 3 + 1}`);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!user) {
      setBookingError('You must sign in as a student to book accommodations.');
      return;
    }

    if (user.role !== 'student') {
      setBookingError('Only registered student roles can secure room allocations. Use the top role-switcher to switch to Student.');
      return;
    }

    if (!roomNumber) {
      setBookingError('Please select a specific available room number.');
      return;
    }

    const priceMultiplier = duration === 'Full Year' ? 2 : 1;
    const finalPrice = hostel.price * priceMultiplier;

    // Save Booking
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      studentId: user.uid,
      hostelId: hostel.id,
      roomNumber,
      checkInDate,
      checkOutDate,
      duration,
      numberOfGuests,
      specialRequests,
      status: 'pending',
      totalPrice: finalPrice,
      depositPaid: false,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DBService.saveBooking(newBooking);
    
    // Decrement available room
    const updatedAvailable = Math.max(0, hostel.availableRooms - 1);
    DBService.saveHostel({
      ...hostel,
      availableRooms: updatedAvailable
    });
    setHostel(prev => prev ? { ...prev, availableRooms: updatedAvailable } : null);

    setBookingSuccess(`Room booking submitted successfully! Reference ID: ${newBooking.id}. Wait for warden confirmation.`);
    // Reset selection
    setRoomNumber('');
    setSpecialRequests('');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;

    const newInquiry: InquiryMessage = {
      id: `inq-${Date.now()}`,
      senderName: user?.displayName || 'Anonymous Student',
      senderEmail: user?.email || 'inquiries@kabarak.ac.ke',
      senderPhone: user?.profileData?.phone || '+254 700 000 000',
      hostelId: hostel.id,
      message: inquiryText,
      createdAt: new Date().toISOString(),
      replied: false
    };

    DBService.saveInquiry(newInquiry);
    setInquirySuccess(true);
    setInquiryText('');
    setTimeout(() => setInquirySuccess(false), 5000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      studentName: user?.displayName || 'Sharon Jemutai',
      studentId: user?.uid || 'std-sharon',
      hostelId: hostel.id,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    DBService.saveReview(newReview);
    setReviewSuccess(true);
    setReviewComment('');
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  const isSoldOut = hostel.availableRooms <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Back button link rail */}
      <button 
        onClick={() => onNavigate('browse')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-slate-50 border border-slate-150 rounded-lg px-3.5 py-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Room Catalog
      </button>

      {/* Main Grid Header info & photo gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Photo Gallery - Left Block (col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-slate-100 relative">
            <img 
              src={activePhoto} 
              alt={hostel.name} 
              className="w-full h-full object-cover transition-opacity duration-300"
              referrerPolicy="no-referrer"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-xs">
                <span className="bg-rose-500/90 text-white font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg border border-rose-400 text-sm">
                  Full Allocation Reached
                </span>
              </div>
            )}
            
            {/* Wishlist toggle */}
            <button 
              onClick={() => setIsWished(!isWished)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-slate-100 flex items-center justify-center text-rose-500 hover:scale-105 transition-transform"
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {hostel.media.map((pic) => (
              <button
                key={pic.public_id}
                onClick={() => setActivePhoto(pic.secure_url)}
                className={`w-28 aspect-video rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activePhoto === pic.secure_url 
                    ? 'border-indigo-600 shadow-xs' 
                    : 'border-slate-150 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={pic.secure_url} alt="Room view" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Core Property Details tab views */}
          <div className="space-y-6 pt-4 bg-white border border-slate-150 rounded-2xl p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100 font-mono">
                  {category?.name}
                </span>
                <span className="flex items-center text-xs font-bold text-amber-500 gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {avgRating} ({reviews.length} reviews)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {hostel.name}
              </h2>
              <div className="flex items-center text-sm text-slate-500 gap-1 font-sans">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" /> {hostel.location}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Accommodation Description</h4>
              <p className="text-sm font-sans text-slate-600 leading-relaxed">
                {hostel.description}
              </p>
            </div>

            {/* Core comfort details */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Amenities & Shared Facilities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {hostel.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2.5 text-xs text-slate-650 font-sans">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory rules */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Rule Guidelines & Visitor Policy</h4>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4.5 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Note on Kabarak Statutes
                </div>
                {hostel.rules.map((rule, idx) => (
                  <p key={idx} className="flex gap-2 font-medium">
                    <span className="text-amber-500 font-bold">&#8226;</span> {rule}
                  </p>
                ))}
              </div>
            </div>

            {/* Manager Contact Profile Card */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Landlord/Warden Contact</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 border border-slate-150 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-250 border border-slate-200 shrink-0">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt=" Alice" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm"> Alice Chebet</h5>
                    <p className="text-[10px] text-slate-400 font-mono leading-none pt-0.5">
                      Warden Head Officer &middot; Eden Wing
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('Dialing: +254 712 345 678. In a real environment, this triggers direct dial.')}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-850 px-3 py-2 border border-slate-200 font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <a 
                    href={`https://wa.me/254712345678?text=Hello%20Alice,%20I'm%20interested%20in%20arranging%20room%20allocations%20for%20${encodeURIComponent(hostel.name)}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 font-bold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Inquiry subform */}
              <form onSubmit={handleInquirySubmit} className="space-y-3 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Send Direct Inquiry
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={300}
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="Ask warden details (e.g. Is water constantly available?)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs py-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0"
                  >
                    {inquirySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {inquirySuccess && (
                  <p className="text-[10px] font-bold text-emerald-600">
                    Message posted live! Your inquiry is registered in the warden's active dashboard.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Room Allocator Form card - Right Block (col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-xs sticky top-24 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rental Allocation</h4>
            <div className="flex items-baseline justify-between mt-1 h-8">
              <p className="text-xl font-sans font-extrabold text-slate-900 leading-none">
                KES {hostel.price.toLocaleString()}
                <span className="text-xs font-normal text-slate-400">/semester</span>
              </p>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 font-mono block">Deposit Refundable</span>
                <span className="text-xs font-bold text-indigo-700 font-mono leading-none">KES {hostel.deposit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            {bookingError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl p-3.5 flex items-start gap-1.5 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl p-3.5 flex items-start gap-1.5 font-medium leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                {bookingSuccess}
              </div>
            )}

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Duration Select</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDuration('One Semester')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    duration === 'One Semester' 
                      ? 'bg-igo bg-indigo-50 border-indigo-500 text-indigo-700 shadow-3xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  One Semester
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('Full Year')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    duration === 'Full Year' 
                      ? 'bg-igo bg-indigo-50 border-indigo-500 text-indigo-700 shadow-3xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Full Academic Year
                </button>
              </div>
            </div>

            {/* Room choice dropdown list */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Select Particular Room Space
              </label>
              <select
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-hidden font-sans font-semibold"
              >
                <option value="">-- Choose available allocation room --</option>
                {mockRooms.map(nr => (
                  <option key={nr} value={nr}>Room Space {nr} (Single)</option>
                ))}
              </select>
            </div>

            {/* Dates range pickers */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Alloc From</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono focus:outline-hidden"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Alloc To</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Special Request */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Special Directives</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                maxLength={400}
                placeholder="Study desks near doors, specific floor preferences, quiet roommate alignments, etc."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
              ></textarea>
            </div>

            {/* Summary details */}
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-150 leading-none">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Accomm Fee Subtotal:</span>
                <span className="font-bold text-slate-800">KES {hostel.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Security Deposit Rates:</span>
                <span className="font-bold text-slate-800">KES {hostel.deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Aggregate Total:</span>
                <span>KES {(hostel.price + hostel.deposit).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSoldOut}
              className={`w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-md ${
                isSoldOut 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-100'
              }`}
            >
              Request Room Placement <Sparkles className="w-4.5 h-4.5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center leading-normal font-sans">
            Submission acts as a legally binding accommodation commitment subject to Kabarak landlord regulations and safety audits.
          </p>
        </div>
      </div>

      {/* Reviews & Submit Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-100">
        
        {/* Review list */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Student Reviews ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs italic">
              No testimonials posted yet for this residency hall. Be the first to review!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 border border-white flex items-center justify-center font-bold text-indigo-700 text-sm italic shadow-2xs">
                        {r.studentName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{r.studentName}</h5>
                        <p className="text-[9px] text-slate-400 font-mono">{r.createdAt.split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cast your review */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-150 rounded-3xl p-6 self-start space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Cast Resident Testimonial</h4>
            <p className="text-[11px] text-slate-500 font-sans leading-snug">
              Share your placement impressions to assist fellow Kabarak candidates.
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2">
            {reviewSuccess && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                Warden Review posted! Star ratings will update metrics shortly.
              </p>
            )}

            {/* Rating Stars selectable */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rating</span>
              <div className="flex gap-1.2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Feedback Comment</label>
              <textarea
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Comfort indices, warden coordination feedback, Wi-Fi reliability comments..."
                rows={4}
                className="w-full bg-white border border-slate-205 rounded-xl p-3 text-xs focus:outline-hidden font-sans leading-relaxed shadow-3xs"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all w-full flex items-center justify-center gap-1 shadow-2xs"
            >
              Post Feedback Review
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
