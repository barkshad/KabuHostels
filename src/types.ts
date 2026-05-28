/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  order: number;
}

export interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  order: number;
}

export interface Hostel {
  id: string;
  name: string;
  description: string;
  price: number; // price per semester
  deposit: number;
  categoryId: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableRooms: number;
  amenities: string[];
  rules: string[];
  managerAgentId: string;
  status: 'available' | 'occupied' | 'maintenance' | 'hidden';
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
  semester: string;
}

export interface Booking {
  id: string;
  studentId: string;
  hostelId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  duration: string; // e.g. "One Semester", "Full Year"
  numberOfGuests: number;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalPrice: number;
  depositPaid: boolean;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  profilePhotoURL: string;
  hostelName: string;
  businessDetails: string;
  isActive: boolean;
  commission: number;
  createdAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Student {
  id: string;
  email: string;
  studentId: string; // Kabarak student ID
  fullName: string;
  phone: string;
  year: string; // "1st", "2nd", "3rd", "4th"
  course: string;
  profilePhotoURL: string;
  createdAt: string;
  verificationStatus: 'pending' | 'verified';
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ctaText: string;
  ctaButtonText: string;
  featuredHostelIds: string[];
  platformName: string;
  university: string;
  contactEmail: string;
  supportPhone: string;
  commissionRate: number;
}

export interface Review {
  id: string;
  studentName: string;
  studentId: string;
  hostelId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface InquiryMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  hostelId: string;
  message: string;
  createdAt: string;
  replied: boolean;
  replyText?: string;
}

export type UserRole = 'student' | 'manager' | 'admin';

export interface ActiveUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  profileData: Student | Manager | null;
}
