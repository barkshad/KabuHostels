/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbModule';
import { Booking, Hostel, Category, InquiryMessage, Manager } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building, Calendar, DollarSign, Activity, Users, Star, Plus, Edit, Trash2, 
  Check, X, MessageSquare, Reply, ChevronRight, Save, Image, RefreshCw, Smartphone, 
  MapPin, CheckCircle2 
} from 'lucide-react';

interface ManagerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const { user, updateManager } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myHostels, setMyHostels] = useState<Hostel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<InquiryMessage[]>([]);
  
  // Tab controller
  const [activeTab, setActiveTab] = useState<'stats' | 'properties' | 'orders' | 'messages' | 'profile'>('stats');

  // Form states (Add/Edit property)
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingHostelId, setEditingHostelId] = useState<string | null>(null);
  
  const [hName, setHName] = useState('');
  const [hCategory, setHCategory] = useState('');
  const [hPrice, setHPrice] = useState(15000);
  const [hDeposit, setHDeposit] = useState(3000);
  const [hCapacity, setHCapacity] = useState(100);
  const [hLocation, setHLocation] = useState('');
  const [hDesc, setHDesc] = useState('');
  const [hAmenities, setHAmenities] = useState<string[]>([]);
  const [hRules, setHRules] = useState<string[]>([]);
  const [hImage, setHImage] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80');

  // Simulated Media upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Reply modal state
  const [replyInquiryId, setReplyInquiryId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  // Manager profile inputs
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mWhatsapp, setMWhatsapp] = useState('');
  const [mHostelName, setMHostelName] = useState('');
  const [mBusiness, setMBusiness] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const refreshData = () => {
    if (!user) return;
    
    // Seed/initialize DB first safely
    DBService.initialize();

    const allBookings = DBService.getBookings();
    const hostels = DBService.getHostels().filter(h => h.managerAgentId === user.uid);
    setMyHostels(hostels);

    const categoriesList = DBService.getCategories();
    setCategories(categoriesList);
    if (categoriesList.length > 0 && !hCategory) {
      setHCategory(categoriesList[0].id);
    }

    // Bookings linked to properties owned by this manager
    const hostelIds = hostels.map(h => h.id);
    const relatedBookings = allBookings.filter(b => hostelIds.includes(b.hostelId));
    setBookings(relatedBookings);

    // Inquiries associated with my hostels
    const allInquiries = DBService.getInquiries();
    const relatedInquiries = allInquiries.filter(i => hostelIds.includes(i.hostelId));
    setInquiries(relatedInquiries);

    // Profile settings
    if (user.profileData) {
      const prof = user.profileData as Manager;
      setMName(prof.name);
      setMPhone(prof.phone);
      setMWhatsapp(prof.whatsappNumber);
      setMHostelName(prof.hostelName);
      setMBusiness(prof.businessDetails);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Aggregate stats calculations
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length;
  
  const estimatedRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'checked-in')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Calculate generic occupancy average
  const totalCapacitySum = myHostels.reduce((sum, h) => sum + h.capacity, 0);
  const totalAvailableSum = myHostels.reduce((sum, h) => sum + h.availableRooms, 0);
  const occupancyPercentage = totalCapacitySum > 0 
    ? Math.round(((totalCapacitySum - totalAvailableSum) / totalCapacitySum) * 100)
    : 72; // solid default index

  // Workflow actions
  const handleBookingStatusChange = (bookingId: string, status: Booking['status']) => {
    const bk = DBService.getBookingById(bookingId);
    if (!bk) return;

    DBService.saveBooking({
      ...bk,
      status,
      // If confirmed, make payment status paid for convenient flow
      paymentStatus: status === 'confirmed' || status === 'checked-in' ? 'paid' : bk.paymentStatus
    });

    refreshData();
    alert(`Placement ticket successfully updated to status: ${status.toUpperCase()}`);
  };

  const handleInquiryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInquiryId || !replyBody.trim()) return;

    DBService.replyInquiry(replyInquiryId, replyBody);
    setReplyInquiryId(null);
    setReplyBody('');
    refreshData();
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateManager({
      name: mName,
      phone: mPhone,
      whatsappNumber: mWhatsapp,
      hostelName: mHostelName,
      businessDetails: mBusiness
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  const handlePropertyDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this hostel property package? All list visibility will cease immediately.')) {
      DBService.deleteHostel(id);
      refreshData();
    }
  };

  // Launch modal for editing
  const openEditPropertyModal = (h: Hostel) => {
    setEditingHostelId(h.id);
    setHName(h.name);
    setHCategory(h.categoryId);
    setHPrice(h.price);
    setHDeposit(h.deposit);
    setHCapacity(h.capacity);
    setHLocation(h.location);
    setHDesc(h.description);
    setHAmenities(h.amenities);
    setHRules(h.rules);
    setHImage(h.media[0]?.secure_url || '');
    setShowPropertyModal(true);
  };

  const openAddPropertyModal = () => {
    setEditingHostelId(null);
    setHName('');
    if (categories.length > 0) setHCategory(categories[0].id);
    setHPrice(15000);
    setHDeposit(3000);
    setHCapacity(80);
    setHLocation('Rafiki Student Area, Kabarak campus border');
    setHDesc('Beautiful studio-style single-sharing rooms with constant hot showers, reliable Wi-Fi, study lounge and high gated security patrols.');
    setHAmenities(['High-speed Wi-Fi', 'Hot Showers', 'Biometric Security', 'Study Desks & Chairs']);
    setHRules(['Curfew lock at 10:00 PM', 'Visiting registers mandatory']);
    setHImage('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80');
    setShowPropertyModal(true);
  };

  // Simulated Media upload pipeline with progress feedback
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadStatus('Staging selected file...');
    
    // Step 1: Compress
    setTimeout(() => {
      setUploadStatus('Compressing: 4.8MB -> 230KB (Lossless PNG optimized)...');
    }, 800);

    // Step 2: Push to Storage
    setTimeout(() => {
      setUploadStatus('Uploading asset to Cloudinary CDN storage headers...');
    }, 1800);

    // Step 3: Complete
    setTimeout(() => {
      // Pick a random alternative beautiful hostel image to visual interest!
      const alternativeImages = [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
      ];
      const randomImg = alternativeImages[Math.floor(Math.random() * alternativeImages.length)];
      setHImage(randomImg);
      setIsUploading(false);
      setUploadStatus('Upload Complete!');
    }, 2800);
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName || !hPrice) return;

    const hostelObj: Hostel = {
      id: editingHostelId || `hostel-${Date.now()}`,
      name: hName,
      description: hDesc,
      price: Number(hPrice),
      deposit: Number(hDeposit),
      categoryId: hCategory,
      location: hLocation,
      latitude: -0.1710 + (Math.random() - 0.5) * 0.005, // random coordinate in Kabarak bounds
      longitude: 35.9690 + (Math.random() - 0.5) * 0.005,
      capacity: Number(hCapacity),
      availableRooms: editingHostelId ? (DBService.getHostelById(editingHostelId)?.availableRooms || Number(hCapacity)) : Number(hCapacity),
      amenities: hAmenities,
      rules: hRules,
      managerAgentId: user?.uid || 'mgr-alice',
      status: 'available',
      media: [
        {
          public_id: `img-${Date.now()}`,
          secure_url: hImage,
          resource_type: 'image',
          order: 1
        }
      ],
      createdAt: editingHostelId ? (DBService.getHostelById(editingHostelId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      semester: 'Jan-April 2026'
    };

    DBService.saveHostel(hostelObj);
    setShowPropertyModal(false);
    refreshData();
    alert(editingHostelId ? 'Hostel specifications updated successfully!' : 'New hostel posted successfully!');
  };

  const toggleFormAmenity = (a: string) => {
    setHAmenities(prev => 
      prev.includes(a) ? prev.filter(item => item !== a) : [...prev, a]
    );
  };

  const allPossibleAmenities = [
    'High-speed Wi-Fi', 'Hot Showers', 'Laundry Rooms', 'Biometric Security', 
    'Study Desks & Chairs', 'Purified Water Station', 'Backup Generator', 
    'Private Bathrooms & Hot Showers', 'Kitchenette Space', 'Recreation Room (Pool Table)',
    'Solar Power Backup', 'Free Campus Morning/Evening Shuttle'
  ];

  const getStatusClass = (status: Booking['status']) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-700 font-bold';
    if (status === 'confirmed') return 'bg-emerald-100 text-emerald-700 font-bold';
    if (status === 'checked-in') return 'bg-indigo-100 text-indigo-700 font-bold';
    return 'bg-slate-100 text-slate-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* 1. Header with title and tab switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-150 gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">Agency Workspace</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hostel Management Panel</h2>
          <p className="text-slate-500 text-sm">
            Managing properties: <span className="font-bold text-slate-700">{user?.profileData?.hostelName || 'Eden Block'}</span>
          </p>
        </div>

        {/* Tab lists */}
        <div className="flex flex-wrap bg-slate-100/80 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto self-start">
          {[
            { id: 'stats', label: 'Overview' },
            { id: 'properties', label: 'My Hostels' },
            { id: 'orders', label: 'Bookings' },
            { id: 'messages', label: 'Student Inquiries' },
            { id: 'profile', label: 'Agency Profile' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.id 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Overview / statistics tab */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Quick numbers widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Active Bookings</span>
                <p className="text-2xl font-extrabold text-slate-900 font-sans">{totalBookingsCount}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Confirmed tenants</span>
                <p className="text-2xl font-extrabold text-[#059669] font-sans">{confirmedBookingsCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl font-bold">
                <Check className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">My Occupancy Rate</span>
                <p className="text-2xl font-extrabold text-slate-900 font-sans">{occupancyPercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl font-bold">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Accrued Income</span>
                <p className="text-2xl font-extrabold text-indigo-700 font-mono">KES {estimatedRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-55 text-indigo-700 flex items-center justify-center rounded-xl font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphical custom SVG dashboard segment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Graph (Occupancy) - col 8 */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Month-on-Month Occupancy Trend (2026)</h4>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Status: Ascending</span>
              </div>
              
              {/* Custom SVG line Chart */}
              <div className="h-56 w-full relative flex items-end">
                {/* Horizontal reference grid lines */}
                <div className="absolute inset-x-0 bottom-0 border-b border-slate-200"></div>
                <div className="absolute inset-x-0 bottom-[25%] border-b border-slate-200/50"></div>
                <div className="absolute inset-x-0 bottom-[50%] border-b border-slate-200/50"></div>
                <div className="absolute inset-x-0 bottom-[75%] border-b border-slate-200/50"></div>
                <div className="absolute inset-x-0 top-0 border-b border-slate-200/20"></div>

                <div className="flex-1 flex justify-around items-end h-44 z-10 px-6 font-sans">
                  {/* Jan */}
                  <div className="flex flex-col items-center gap-2 w-14">
                    <div className="w-10 rounded-t-lg bg-indigo-500/20 border-t-2 border-indigo-500" style={{ height: '40%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Jan (40%)</span>
                  </div>
                  {/* Feb */}
                  <div className="flex flex-col items-center gap-2 w-14">
                    <div className="w-10 rounded-t-lg bg-indigo-550/30 border-t-2 border-indigo-550" style={{ height: '55%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Feb (55%)</span>
                  </div>
                  {/* Mar */}
                  <div className="flex flex-col items-center gap-2 w-14">
                    <div className="w-10 rounded-t-lg bg-indigo-600/40 border-t-2 border-indigo-600" style={{ height: '70%' }}></div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Mar (70%)</span>
                  </div>
                  {/* Apr (Active) */}
                  <div className="flex flex-col items-center gap-2 w-14">
                    <div className="w-10 rounded-t-lg bg-indigo-700/80 border-t-2 border-indigo-700 shadow-md" style={{ height: `${occupancyPercentage}%` }}></div>
                    <span className="text-[10px] font-bold text-slate-800 font-mono">Apr ({occupancyPercentage}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Pending orders helper card - col 4 */}
            <div className="lg:col-span-4 bg-white border border-slate-150 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Pending Decisions</h4>
              
              {bookings.filter(b => b.status === 'pending').length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 italic font-sans">
                  All allocation tickets resolved! No pending items.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'pending').slice(0, 3).map(b => (
                    <div key={b.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Student: Sharon J.</p>
                        <span className="text-[9px] text-slate-400 font-mono">Room space {b.roomNumber}</span>
                      </div>
                      <ChevronRight 
                        className="w-4 h-4 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        onClick={() => setActiveTab('orders')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. My Hostels tab */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Active Hostel Physical Portals</h3>
            <button
              onClick={openAddPropertyModal}
              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-2xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Post New Hostel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myHostels.map(h => (
              <div key={h.id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-3xs flex flex-col justify-between">
                <div>
                  <div className="aspect-video w-full bg-slate-100 relative">
                    <img src={h.media[0]?.secure_url} alt={h.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs font-bold text-[9px] uppercase tracking-wider py-0.5 px-2 rounded-full border">
                      {h.semester}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">{h.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {h.location}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-50 font-sans">
                      <p>Capacity: <span className="text-indigo-600 font-mono">{h.capacity}</span></p>
                      <p>Available: <span className="text-emerald-600 font-mono">{h.availableRooms}</span></p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <span className="font-sans font-bold text-slate-800 text-xs">
                    KES {h.price.toLocaleString()} / sem
                  </span>
                  
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => openEditPropertyModal(h)}
                      className="p-1.5 rounded-lg border border-slate-205 text-slate-650 hover:text-indigo-600 hover:bg-white bg-white transition-colors"
                      title="Edit specifications"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePropertyDelete(h.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:text-white hover:bg-rose-500 bg-white transition-colors"
                      title="Delete hostel listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Bookings Allocation tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Room Placements & Allocation Tickets ({bookings.length})</h3>
          
          <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="p-4 leading-none text-[10px]">Reference No</th>
                  <th className="p-4 leading-none text-[10px]">Tenant Name</th>
                  <th className="p-4 leading-none text-[10px]">Room Code</th>
                  <th className="p-4 leading-none text-[10px]">Semester Duration</th>
                  <th className="p-4 leading-none text-[10px]">Fee context</th>
                  <th className="p-4 leading-none text-[10px]">Status Badge</th>
                  <th className="p-4 leading-none text-[10px] text-center">Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold font-mono text-slate-900">{b.id}</td>
                    <td className="p-4 font-bold text-slate-800">Sharon Jemutai</td>
                    <td className="p-4 font-bold text-indigo-700 font-mono">{b.roomNumber}</td>
                    <td className="p-4 font-medium text-slate-500">{b.duration}</td>
                    <td className="p-4 font-bold text-slate-800 font-mono">KES {b.totalPrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${getStatusClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-1.5">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleBookingStatusChange(b.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] leading-tight"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBookingStatusChange(b.id, 'cancelled')}
                            className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold px-2 py-1 rounded text-[10px] leading-tight"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleBookingStatusChange(b.id, 'checked-in')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1 rounded text-[10px] leading-tight"
                        >
                          Check-In Tenant
                        </button>
                      )}

                      {b.status === 'checked-in' && (
                        <button
                          onClick={() => handleBookingStatusChange(b.id, 'checked-out')}
                          className="bg-slate-950 hover:bg-indigo-600 text-white font-bold px-2.5 py-1 rounded text-[10px] leading-tight"
                        >
                          Check-Out Check
                        </button>
                      )}

                      {b.status === 'cancelled' && (
                        <span className="text-slate-400 italic text-[11px] font-sans">Placement Revoked</span>
                      )}

                      {b.status === 'checked-out' && (
                        <span className="text-slate-400 italic text-[11px] font-sans">Tenant Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="py-20 text-center text-xs text-slate-400 italic">
                No bookings registered under your active properties catalog.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Messages/Inquiries tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Student inquiries & queries Inbox ({inquiries.length})</h3>
          
          <div className="space-y-4 max-w-4xl">
            {inquiries.map(i => {
              const hostel = DBService.getHostelById(i.hostelId);
              return (
                <div key={i.id} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{i.senderName}</h4>
                      <p className="text-[10px] text-slate-400 font-sans pt-0.5">
                        Email: {i.senderEmail} &middot; Phone: {i.senderPhone}
                      </p>
                    </div>
                    <span className="bg-slate-50 border text-[9px] font-bold text-slate-505 font-mono px-2 py-1 rounded-md">
                      RE: {hostel?.name || 'Eden Hall'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-650 bg-slate-50/50 rounded-xl p-4.5 border border-slate-105 italic font-sans leading-relaxed">
                    "{i.message}"
                  </p>

                  {i.replied ? (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4.5 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono">My Response</p>
                      <p className="text-xs text-emerald-950 font-sans leading-relaxed">
                        {i.replyText}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {replyInquiryId === i.id ? (
                        <form onSubmit={handleInquiryReply} className="space-y-3 pt-2">
                          <textarea
                            required
                            rows={3}
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Draft reply advice to student..."
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-sans focus:outline-hidden"
                          ></textarea>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setReplyInquiryId(null)}
                              className="text-xs font-bold text-slate-505"
                            >
                              Discard
                            </button>
                            <button
                              type="submit"
                              className="bg-[#059669] hover:bg-slate-900 text-white font-bold text-xs py-1.8 px-3.5 rounded-lg flex items-center gap-1 shadow-3xs"
                            >
                              <Reply className="w-3.5 h-3.5 animate-pulse" /> Dispatch Reply
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyInquiryId(i.id);
                            setReplyBody('');
                          }}
                          className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-1.8 px-3.5 rounded-lg flex items-center gap-1 shadow-3xs"
                        >
                          <Reply className="w-3.5 h-3.5" /> Reply to student
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {inquiries.length === 0 && (
              <div className="py-20 text-center text-xs text-slate-450 italic bg-slate-50 border rounded-2xl">
                No student inquiries registered yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Profile Customizer tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-3xs max-w-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Agency Business Details</h3>
            <p className="text-xs text-slate-450 leading-snug">Edit registered telephone, brand names and commercial licenses.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Representative Name</label>
              <input
                type="text"
                required
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Mobile Node</label>
              <input
                type="text"
                required
                value={mPhone}
                onChange={(e) => setMPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">WhatsApp Number</label>
              <input
                type="text"
                required
                value={mWhatsapp}
                onChange={(e) => setMWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Managed Properties Headline</label>
              <input
                type="text"
                required
                value={mHostelName}
                onChange={(e) => setMHostelName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Business details & Bio</label>
              <textarea
                required
                rows={4}
                value={mBusiness}
                onChange={(e) => setMBusiness(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans text-slate-800 focus:outline-hidden"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-100">
            {profileSuccess && (
              <span className="text-[11px] font-bold text-emerald-650 self-center mr-auto">
                Profile configurations saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" /> Save Agency Configurations
            </button>
          </div>
        </form>
      )}

      {/* 7. DRAW MODAL FOR ADD/EDIT Properties */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingHostelId ? 'Modify Hostel Specifications' : 'Publish New physical Hostel inventory'}
              </h3>
              <button 
                onClick={() => setShowPropertyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePropertySubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Hostel/Residency Name</label>
                  <input
                    type="text"
                    required
                    value={hName}
                    onChange={(e) => setHName(e.target.value)}
                    placeholder="e.g. Shalom Place"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Residency category type</label>
                  <select
                    value={hCategory}
                    onChange={(e) => setHCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Fee per Semester (KES)</label>
                  <input
                    type="number"
                    required
                    value={hPrice}
                    onChange={(e) => setHPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Security Refundable Deposit (KES)</label>
                  <input
                    type="number"
                    required
                    value={hDeposit}
                    onChange={(e) => setHDeposit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-xs">Room Capacity Allocation</label>
                  <input
                    type="number"
                    required
                    value={hCapacity}
                    onChange={(e) => setHCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Physical Address Location</label>
                  <input
                    type="text"
                    required
                    value={hLocation}
                    onChange={(e) => setHLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Media simulated comp uploader */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Staging showcase photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={hImage}
                    onChange={(e) => setHImage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSimulatedUpload}
                    disabled={isUploading}
                    className="bg-slate-900 border hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Image className="w-4 h-4" /> Simulate Image Compression
                  </button>
                </div>

                {isUploading && (
                  <div className="bg-slate-50 p-4 border rounded-xl space-y-2 text-xs text-slate-505">
                    <p className="font-bold flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> {uploadStatus}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full animate-marquee-progress" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed overview description</label>
                <textarea
                  required
                  rows={3}
                  value={hDesc}
                  onChange={(e) => setHDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden"
                ></textarea>
              </div>

              {/* Amenities multi values selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Amenities Check List</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {allPossibleAmenities.map(a => {
                    const isChecked = hAmenities.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleFormAmenity(a)}
                        className={`py-1.5 px-3 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate leading-none font-sans text-[11px]">{a}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="text-slate-400 font-semibold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-2xs"
                >
                  Commit Hostel Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
