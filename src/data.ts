/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Hostel, SiteSettings, Manager, Student, Review, InquiryMessage, Booking } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-girls',
    name: "Girls' Residence Halls",
    slug: 'girls-residence',
    description: 'Secure, clean, and comfortable on-campus or close off-campus halls exclusively for ladies.',
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-boys',
    name: "Boys' Residence Halls",
    slug: 'boys-residence',
    description: 'Active, high-integrity environment on-campus or close off-campus halls exclusively for gentlemen.',
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-grad',
    name: 'Graduates & Postgrad Housing',
    slug: 'graduates-housing',
    description: 'Quiet, premium single-room installations configured for postgraduates, seniors, and research scholars.',
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-mixed',
    name: 'Off-Campus Mixed Hostels',
    slug: 'off-campus-mixed',
    description: 'Approved off-campus modern apartments with strict security, offering mixed-block accommodations.',
    isActive: true,
    order: 4,
  }
];

export const INITIAL_MANAGERS: Manager[] = [
  {
    id: 'mgr-alice',
    name: 'Alice Chebet',
    email: 'alice.chebet@kabarak.ac.ke',
    phone: '+254 712 345 678',
    whatsappNumber: '+254712345678',
    profilePhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    hostelName: 'Eden Hall & Shalom Place',
    businessDetails: 'Registered Kabarak Accommodation Services Agent with 8+ years overseeing student housing comfort.',
    isActive: true,
    commission: 5,
    createdAt: new Date(Date.now() - 31536000000).toISOString(),
    verificationStatus: 'verified',
  },
  {
    id: 'mgr-john',
    name: 'John Mwangi',
    email: 'john.mwangi@kabarakhostels.co.ke',
    phone: '+254 723 456 789',
    whatsappNumber: '+254723456789',
    profilePhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    hostelName: 'Ebenezer Court & Baraka Heights',
    businessDetails: 'Dedicated privately-owned student hostel management specialist, managing clean safe off-campus residency.',
    isActive: true,
    commission: 5,
    createdAt: new Date(Date.now() - 15768000000).toISOString(),
    verificationStatus: 'verified',
  },
  {
    id: 'mgr-susan',
    name: 'Susan Wanjiku',
    email: 's.wanjiku@kabarak.ac.ke',
    phone: '+254 734 567 890',
    whatsappNumber: '+254734567890',
    profilePhotoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    hostelName: 'Graduates Residency',
    businessDetails: 'Kabarak Main Campus Housing Warden handling premium senior student units and international scholar wings.',
    isActive: true,
    commission: 0,
    createdAt: new Date(Date.now() - 47304000000).toISOString(),
    verificationStatus: 'verified',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-sharon',
    email: 'student@kabarak.ac.ke',
    studentId: 'CS/M/1045/09/23',
    fullName: 'Sharon Jemutai',
    phone: '+254 745 890 123',
    year: '3rd',
    course: 'BSc. Computer Science',
    profilePhotoURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date(Date.now() - 47304000).toISOString(),
    verificationStatus: 'verified',
  }
];

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel-eden',
    name: 'Eden Hall (Main Campus)',
    description: 'Premier on-campus girls\' residency featuring pristine high-integrity standards, spacious layouts, and instant access to class complexes, the campus chapel, and gym facilities. Ideal for undergraduate ladies wanting a peaceful, secure, Christian environment with top-tier amenities.',
    price: 18500, // per semester
    deposit: 3000,
    categoryId: 'cat-girls',
    location: 'Main Campus East Wing, near University Chapel',
    latitude: -0.1695,
    longitude: 35.9680,
    capacity: 120,
    availableRooms: 12,
    amenities: ['High-speed Wi-Fi', 'Hot Showers', 'Laundry Rooms', 'Biometric Security', 'Study Desks & Chairs', 'Purified Water Station', 'Backup Generator', '24/7 Wardens'],
    rules: ['Visiting hours: 10:00 AM - 6:00 PM (Strict)', 'No loud music after 8:00 PM', 'Curfew curfew time of 10:00 PM', 'No alcohol or substances on campus premises'],
    managerAgentId: 'mgr-alice',
    status: 'available',
    media: [
      {
        public_id: 'eden_main',
        secure_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 1
      },
      {
        public_id: 'eden_room',
        secure_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 2
      },
      {
        public_id: 'eden_lounge',
        secure_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 3
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    semester: 'Jan-April 2026'
  },
  {
    id: 'hostel-ebenezer',
    name: 'Ebenezer Court (Off-Campus)',
    description: 'High-security off-campus boys\' hostel located just 400 meters from the Kabarak University main gate. It offers modern single bed spaces and shared studios, private kitchenettes, hot water systems, and a vibrant community hall with recreational gear like pool and table tennis.',
    price: 16000,
    deposit: 2500,
    categoryId: 'cat-boys',
    location: 'Kabarak-Rafiki Road, 400m from Main Gate',
    latitude: -0.1712,
    longitude: 35.9710,
    capacity: 80,
    availableRooms: 5,
    amenities: ['High-speed Wi-Fi', 'Private Bathrooms & Hot Showers', 'Kitchenette Space', 'Recreation Room (Pool Table)', 'Secured Perimeter Fence', 'Solar Power Backup', 'Borehole Water System'],
    rules: ['Quiet hours from 10:00 PM', 'Visitors must register at security gate', 'Respect fellow roommates', 'Keep shared kitchenette tidy'],
    managerAgentId: 'mgr-john',
    status: 'available',
    media: [
      {
        public_id: 'eben_main',
        secure_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 1
      },
      {
        public_id: 'eben_bed',
        secure_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 2
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    semester: 'Jan-April 2026'
  },
  {
    id: 'hostel-grad',
    name: 'Graduates Residency (Main Campus)',
    description: 'An premium, peaceful on-campus residency hall designed exclusively for postgraduate students, international scholars, and final-year senior students. Fully furnished premium single rooms with attached bathrooms, shared chef-ready kitchens, quiet gardens, and high-speed fiber internet.',
    price: 24000,
    deposit: 5000,
    categoryId: 'cat-grad',
    location: 'Main Campus West Wing, adjacent to Postgraduate Block',
    latitude: -0.1680,
    longitude: 35.9655,
    capacity: 40,
    availableRooms: 8,
    amenities: ['Premium Fibre Internet', 'En-suite Private Toilets & Hot Shower', 'Fully Equipped Shared Kitchenell', 'Weekly Cleaning Services', 'Quiet Study Lounge', 'Private Landscaped Gardens', 'CCTV & Elite Campus Guard Patrol'],
    rules: ['Academic quiet zone standards apply at all times', 'Undergraduates not allowed unless approved by head warden', 'Guests must depart by 8:00 PM', 'Strict energy conservation policies'],
    managerAgentId: 'mgr-susan',
    status: 'available',
    media: [
      {
        public_id: 'grad_main',
        secure_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 1
      },
      {
        public_id: 'grad_int',
        secure_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 2
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    semester: 'Jan-April 2026'
  },
  {
    id: 'hostel-shalom',
    name: 'Shalom Place for Ladies',
    description: 'Approved off-campus girls\' hostel providing high-security gated accommodations. Features state-of-the-art solar water heating, high-speed Wi-Fi, study rooms on each floor, and our signature free Kabarak Campus Shuttle operating 4 times daily to make commuting completely painless.',
    price: 15500,
    deposit: 2000,
    categoryId: 'cat-girls',
    location: 'Off Nakuru-Eldama Ravine Hwy, 600m from gate',
    latitude: -0.1730,
    longitude: 35.9692,
    capacity: 90,
    availableRooms: 0,
    amenities: ['Free Campus Morning/Evening Shuttle', 'Consistent High-Speed Wi-Fi', 'Floor Study Lounges', 'Kitchen Area with Cookers', '24/7 Security Officers + CCTV', 'Fitted Wardrobes', 'Solar Hot Water'],
    rules: ['No male visitors inside rooms at any time', 'Gate locked strictly at 9:30 PM', 'Cooperate with floor captains for hygiene schedules', 'Report any electrical issues immediately'],
    managerAgentId: 'mgr-alice',
    status: 'occupied',
    media: [
      {
        public_id: 'shalom_main',
        secure_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 1
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    semester: 'Jan-April 2026'
  },
  {
    id: 'hostel-baraka',
    name: 'Baraka Heights (Off-Campus Mixed)',
    description: 'Modern, high-rise off-campus apartment with distinct securely segregated wings for male and female students. Located centrally in the Rafiki student zone with panoramic views of the Nakuru sunset. Includes a mini-mart on the ground floor, reliable borehole water, and 24-hr guards.',
    price: 15000,
    deposit: 3000,
    categoryId: 'cat-mixed',
    location: 'Rafiki Central Student Area, Kabarak',
    latitude: -0.1750,
    longitude: 35.9735,
    capacity: 150,
    availableRooms: 23,
    amenities: ['High-speed Internet Integration', 'Standard Bathrooms & Hot Water', 'Ground Floor Mini-Mart & Laundry Shop', 'Constant Water Supply (Borehole)', 'Strict Perimeter Gated Entrance', 'DSTV Common Room', 'Study Carrels'],
    rules: ['Wing boundary rules are strictly monitored via CCTV', 'Loud noise or parties forbidden', 'Rent must be cleared before room allocation', 'Keep common lobby pristine'],
    managerAgentId: 'mgr-john',
    status: 'available',
    media: [
      {
        public_id: 'baraka_main',
        secure_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 1
      },
      {
        public_id: 'baraka_room',
        secure_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        resource_type: 'image',
        order: 2
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    semester: 'Jan-April 2026'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    studentName: 'Sharon Jemutai',
    studentId: 'std-sharon',
    hostelId: 'hostel-eden',
    rating: 5,
    comment: 'Absolutely amazing! Eden Hall offers the most secure and quiet room that I have used since starting my degree at Kabarak. The study desks are highly comfortable, the Wi-Fi is extremely fast (helpful for computer science classes), and the warden is incredibly supportive.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-2',
    studentName: 'Alex Kuria',
    studentId: 'std-sharon', // reused for simple mock relationship
    hostelId: 'hostel-ebenezer',
    rating: 4,
    comment: 'Strongly recommend Ebenezer Court for gentlemen. The recreation room pool table is fantastic for chilling out after busy exam blocks, and the 400m walk to the main gate is dynamic and keeps you fit.',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-sharon-eden',
    studentId: 'std-sharon',
    hostelId: 'hostel-eden',
    roomNumber: 'A-24',
    checkInDate: '2026-05-01',
    checkOutDate: '2026-08-31',
    duration: 'One Semester',
    numberOfGuests: 1,
    specialRequests: 'I would love a first-floor room closest to the study lounge if possible. Thank you!',
    status: 'confirmed',
    totalPrice: 18500,
    depositPaid: true,
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 24).toISOString(),
  }
];

export const INITIAL_INQUIRIES: InquiryMessage[] = [
  {
    id: 'inq-1',
    senderName: 'Sharon Jemutai',
    senderEmail: 'student@kabarak.ac.ke',
    senderPhone: '+254745890123',
    hostelId: 'hostel-eden',
    message: 'Hello, is there safe storage for bicycles at Eden Hall? I commute occasionally within campus.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    replied: true,
    replyText: 'Hi Sharon, yes! We have a locked underground bicycle parking rack that is under constant biometric security and 24/7 CCTV surveillance.'
  },
  {
    id: 'inq-2',
    senderName: 'David Koech',
    senderEmail: 'd.koech@gmail.com',
    senderPhone: '+254755123456',
    hostelId: 'hostel-ebenezer',
    message: 'When are checkout procedures for the end-of-semester periods?',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    replied: false
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  heroTitle: 'Find Your Perfect Kabarak University Hostel Accommodation',
  heroSubtitle: 'Secure, modern, and verified student residence halls and hostels in and around Kabarak Main Campus Nakuru.',
  heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  ctaText: 'Ready to secure your room for the upcoming semester? Browse verified rooms now or list your properties.',
  ctaButtonText: 'Browse Hostels Now',
  featuredHostelIds: ['hostel-eden', 'hostel-ebenezer', 'hostel-grad'],
  platformName: 'KABU Hostels',
  university: 'Kabarak University',
  contactEmail: 'accommodations@kabarak.ac.ke',
  supportPhone: '+254 700 KABARAK (522272)',
  commissionRate: 5
};
