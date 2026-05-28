/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActiveUser, UserRole, Student, Manager } from '../types';
import { DBService } from '../services/dbModule';

interface AuthContextType {
  user: ActiveUser | null;
  loading: boolean;
  switchRole: (role: UserRole, managerId?: string) => void;
  signUpStudent: (data: { studentId: string; fullName: string; email: string; phone: string; course: string; year: string }) => void;
  signUpManager: (data: { name: string; email: string; phone: string; whatsappNumber: string; hostelName: string; businessDetails: string }) => void;
  updateStudent: (data: Partial<Student>) => void;
  updateManager: (data: Partial<Manager>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    DBService.initialize();
    const active = DBService.getActiveUser();
    setUser(active);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    // Listen to simulated auth state updates
    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener('kabu_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('kabu_auth_change', handleAuthChange);
    };
  }, []);

  const switchRole = (role: UserRole, managerId?: string) => {
    setLoading(true);
    DBService.setActiveRole(role, managerId);
    setTimeout(() => {
      refreshUser();
    }, 150);
  };

  const signUpStudent = (data: { studentId: string; fullName: string; email: string; phone: string; course: string; year: string }) => {
    setLoading(true);
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      email: data.email,
      studentId: data.studentId,
      fullName: data.fullName,
      phone: data.phone,
      year: data.year,
      course: data.course,
      profilePhotoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.fullName)}`,
      createdAt: new Date().toISOString(),
      verificationStatus: 'verified' // Auto verified for preview convenience
    };
    
    DBService.saveStudent(newStudent);
    // Force active user as this student
    localStorage.setItem('kabu_hostels_current_role', 'student');
    // Save mapping or make it the active student ID
    localStorage.setItem('kabu_hostels_active_student_id', newStudent.id);
    
    // Quick overwrite to simulate this user
    // We can change getActiveUser to handle active student id if needed
    // In our simplified engine dbModule.ts checks if 'std-sharon' is there. Let's make it support custom registered active user
    localStorage.setItem('kabu_hostels_custom_active_user', JSON.stringify({
      uid: newStudent.id,
      email: newStudent.email,
      displayName: newStudent.fullName,
      role: 'student',
      profileData: newStudent
    }));

    // Raise change event
    window.dispatchEvent(new Event('kabu_auth_change'));
  };

  const signUpManager = (data: { name: string; email: string; phone: string; whatsappNumber: string; hostelName: string; businessDetails: string }) => {
    setLoading(true);
    const newManager: Manager = {
      id: `mgr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber.startsWith('+') ? data.whatsappNumber : `+254${data.whatsappNumber.replace(/^0/, '')}`,
      profilePhotoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      hostelName: data.hostelName,
      businessDetails: data.businessDetails,
      isActive: true,
      commission: 5,
      createdAt: new Date().toISOString(),
      verificationStatus: 'pending' // pending until verified by admin
    };

    DBService.saveManager(newManager);
    localStorage.setItem('kabu_hostels_current_role', 'manager');
    localStorage.setItem('kabu_hostels_active_manager_id', newManager.id);
    window.dispatchEvent(new Event('kabu_auth_change'));
  };

  const updateStudent = (data: Partial<Student>) => {
    if (!user || user.role !== 'student' || !user.profileData) return;
    const updated = { ...(user.profileData as Student), ...data };
    DBService.saveStudent(updated);
    window.dispatchEvent(new Event('kabu_auth_change'));
  };

  const updateManager = (data: Partial<Manager>) => {
    if (!user || user.role !== 'manager' || !user.profileData) return;
    const updated = { ...(user.profileData as Manager), ...data };
    DBService.saveManager(updated);
    window.dispatchEvent(new Event('kabu_auth_change'));
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem('kabu_hostels_custom_active_user');
    DBService.setActiveRole('student'); // fallback
    setTimeout(() => {
      refreshUser();
    }, 150);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      switchRole,
      signUpStudent,
      signUpManager,
      updateStudent,
      updateManager,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
