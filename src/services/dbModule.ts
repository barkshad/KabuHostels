/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Hostel, Booking, Manager, Student, Review, SiteSettings, InquiryMessage, ActiveUser, UserRole } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MANAGERS,
  INITIAL_STUDENTS,
  INITIAL_HOSTELS,
  INITIAL_REVIEWS,
  INITIAL_BOOKINGS,
  INITIAL_INQUIRIES,
  INITIAL_SETTINGS
} from '../data';

// Keys for local storage
const KEYS = {
  CATEGORIES: 'kabu_hostels_categories',
  HOSTELS: 'kabu_hostels_data',
  BOOKINGS: 'kabu_hostels_bookings',
  MANAGERS: 'kabu_hostels_managers',
  STUDENTS: 'kabu_hostels_students',
  REVIEWS: 'kabu_hostels_reviews',
  INQUIRIES: 'kabu_hostels_inquiries',
  SETTINGS: 'kabu_hostels_settings',
  ACTIVE_USER: 'kabu_hostels_active_user',
  CUSTOM_MEDIA: 'kabu_hostels_custom_media'
};

export class DBService {
  private static get<T>(key: string, initialValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }

  static initialize(): void {
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      this.set(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.HOSTELS)) {
      this.set(KEYS.HOSTELS, INITIAL_HOSTELS);
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      this.set(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    }
    if (!localStorage.getItem(KEYS.MANAGERS)) {
      this.set(KEYS.MANAGERS, INITIAL_MANAGERS);
    }
    if (!localStorage.getItem(KEYS.STUDENTS)) {
      this.set(KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(KEYS.REVIEWS)) {
      this.set(KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!localStorage.getItem(KEYS.INQUIRIES)) {
      this.set(KEYS.INQUIRIES, INITIAL_INQUIRIES);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      this.set(KEYS.SETTINGS, INITIAL_SETTINGS);
    }
  }

  static resetToDefault(): void {
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.HOSTELS);
    localStorage.removeItem(KEYS.BOOKINGS);
    localStorage.removeItem(KEYS.MANAGERS);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.REVIEWS);
    localStorage.removeItem(KEYS.INQUIRIES);
    localStorage.removeItem(KEYS.SETTINGS);
    this.initialize();
  }

  static clearAll(): void {
    this.set(KEYS.CATEGORIES, []);
    this.set(KEYS.HOSTELS, []);
    this.set(KEYS.BOOKINGS, []);
    this.set(KEYS.MANAGERS, []);
    this.set(KEYS.STUDENTS, []);
    this.set(KEYS.REVIEWS, []);
    this.set(KEYS.INQUIRIES, []);
  }

  // Categories CRUD
  static getCategories(): Category[] {
    return this.get<Category[]>(KEYS.CATEGORIES, []).sort((a, b) => a.order - b.order);
  }

  static saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    this.set(KEYS.CATEGORIES, categories);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories();
    this.set(KEYS.CATEGORIES, categories.filter(c => c.id !== id));
  }

  // Hostels CRUD
  static getHostels(): Hostel[] {
    return this.get<Hostel[]>(KEYS.HOSTELS, []);
  }

  static getHostelById(id: string): Hostel | undefined {
    return this.getHostels().find(h => h.id === id);
  }

  static saveHostel(hostel: Hostel): void {
    const hostels = this.getHostels();
    const index = hostels.findIndex(h => h.id === hostel.id);
    if (index >= 0) {
      hostels[index] = { ...hostel, updatedAt: new Date().toISOString() };
    } else {
      hostels.push({ ...hostel, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.set(KEYS.HOSTELS, hostels);
  }

  static deleteHostel(id: string): void {
    const hostels = this.getHostels();
    this.set(KEYS.HOSTELS, hostels.filter(h => h.id !== id));
  }

  // Bookings CRUD
  static getBookings(): Booking[] {
    return this.get<Booking[]>(KEYS.BOOKINGS, []);
  }

  static getBookingById(id: string): Booking | undefined {
    return this.getBookings().find(b => b.id === id);
  }

  static saveBooking(booking: Booking): void {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    const oldBooking = index >= 0 ? bookings[index] : null;

    if (index >= 0) {
      bookings[index] = { ...booking, updatedAt: new Date().toISOString() };
    } else {
      bookings.push({ ...booking, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.set(KEYS.BOOKINGS, bookings);

    // Update available rooms if status changed
    const hostel = this.getHostelById(booking.hostelId);
    if (hostel) {
      // If going to cancelled, gain a room back
      if (oldBooking && oldBooking.status !== 'cancelled' && booking.status === 'cancelled') {
        this.saveHostel({
          ...hostel,
          availableRooms: Math.min(hostel.capacity, hostel.availableRooms + 1)
        });
      } else if (!oldBooking && booking.status === 'confirmed') {
        // New confirmed booking reduces room
        this.saveHostel({
          ...hostel,
          availableRooms: Math.max(0, hostel.availableRooms - 1)
        });
      } else if (oldBooking && oldBooking.status === 'pending' && booking.status === 'confirmed') {
        // Moving from pending to confirmed reduces room
        this.saveHostel({
          ...hostel,
          availableRooms: Math.max(0, hostel.availableRooms - 1)
        });
      }
    }
  }

  // Managers CRUD
  static getManagers(): Manager[] {
    return this.get<Manager[]>(KEYS.MANAGERS, []);
  }

  static getManagerById(id: string): Manager | undefined {
    return this.getManagers().find(m => m.id === id);
  }

  static saveManager(manager: Manager): void {
    const managers = this.getManagers();
    const index = managers.findIndex(m => m.id === manager.id);
    if (index >= 0) {
      managers[index] = manager;
    } else {
      managers.push(manager);
    }
    this.set(KEYS.MANAGERS, managers);
  }

  // Students CRUD
  static getStudents(): Student[] {
    return this.get<Student[]>(KEYS.STUDENTS, []);
  }

  static getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  static saveStudent(student: Student): void {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    this.set(KEYS.STUDENTS, students);
  }

  // Reviews API
  static getReviews(): Review[] {
    return this.get<Review[]>(KEYS.REVIEWS, []);
  }

  static getReviewsForHostel(hostelId: string): Review[] {
    return this.getReviews().filter(r => r.hostelId === hostelId);
  }

  static saveReview(review: Review): void {
    const reviews = this.getReviews();
    reviews.push({ ...review, id: `rev-${Date.now()}`, createdAt: new Date().toISOString() });
    this.set(KEYS.REVIEWS, reviews);
  }

  // Inquiries API
  static getInquiries(): InquiryMessage[] {
    return this.get<InquiryMessage[]>(KEYS.INQUIRIES, []);
  }

  static saveInquiry(inquiry: InquiryMessage): void {
    const inquiries = this.getInquiries();
    inquiries.push({ ...inquiry, id: `inq-${Date.now()}`, createdAt: new Date().toISOString() });
    this.set(KEYS.INQUIRIES, inquiries);
  }

  static replyInquiry(inquiryId: string, replyText: string): void {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === inquiryId);
    if (index >= 0) {
      inquiries[index] = {
        ...inquiries[index],
        replied: true,
        replyText
      };
      this.set(KEYS.INQUIRIES, inquiries);
    }
  }

  // Site Settings
  static getSettings(): SiteSettings {
    const defaults = INITIAL_SETTINGS;
    return this.get<SiteSettings>(KEYS.SETTINGS, defaults);
  }

  static saveSettings(settings: SiteSettings): void {
    this.set(KEYS.SETTINGS, settings);
  }

  // Active User session simulation
  static getActiveUser(): ActiveUser | null {
    const userRole = localStorage.getItem('kabu_hostels_current_role') as any || 'student';
    
    if (userRole === 'admin') {
      return {
        uid: 'usr-admin-1',
        email: 'admin@kabarak.ac.ke',
        displayName: 'Super Administrator',
        role: 'admin',
        profileData: null
      };
    } else if (userRole === 'manager') {
      const activeManagerId = localStorage.getItem('kabu_hostels_active_manager_id') || 'mgr-alice';
      const manager = this.getManagerById(activeManagerId) || INITIAL_MANAGERS[0];
      return {
        uid: manager.id,
        email: manager.email,
        displayName: manager.name,
        role: 'manager',
        profileData: manager
      };
    } else {
      // Check if custom active user
      const customUserStr = localStorage.getItem('kabu_hostels_custom_active_user');
      if (customUserStr) {
        try {
          const custom = JSON.parse(customUserStr);
          const student = this.getStudentById(custom.uid);
          if (student) {
            return {
              uid: student.id,
              email: student.email,
              displayName: student.fullName,
              role: 'student',
              profileData: student
            };
          }
        } catch {}
      }

      // Default to student
      const student = this.getStudentById('std-sharon') || INITIAL_STUDENTS[0];
      return {
        uid: student.id,
        email: student.email,
        displayName: student.fullName,
        role: 'student',
        profileData: student
      };
    }
  }

  static setActiveRole(role: UserRole, managerId?: string): void {
    localStorage.setItem('kabu_hostels_current_role', role);
    if (managerId) {
      localStorage.setItem('kabu_hostels_active_manager_id', managerId);
    }
    // Dispatch a custom event to alert Auth Context
    window.dispatchEvent(new Event('kabu_auth_change'));
  }
}
