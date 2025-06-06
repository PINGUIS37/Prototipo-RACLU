export type UserRole = 'student' | 'admin'; // admin for School Services

export interface User {
  id: string; 
  username: string; // For login, can be matricula or admin username
  name: string; // Full name
  role: UserRole;
  matricula?: string; // Student specific
  group?: string; // Student specific
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM" format (24-hour)
  endTime: string;   // "HH:MM" format (24-hour)
  capacity: number;
  enrolledCount: number; 
}

export interface Club {
  id: string;
  name: string;
  description: string;
  categoryIcon?: string; // Lucide icon name e.g. "Users", "Atom", "Music"
  timeSlots: TimeSlot[];
}

export interface Enrollment {
  id: string;
  studentMatricula: string; 
  studentFirstName: string;
  studentLastName: string;
  studentGroup: string; 
  clubId: string;
  timeSlotId: string;
  enrolledAt: string; // ISO date string
}

// For forms
export interface SignUpFormData {
  matricula: string;
  firstName: string;
  lastName: string;
  group: string;
  clubId: string;
  timeSlotId: string;
}

export interface ClubFormData {
  name: string;
  description: string;
  categoryIcon?: string;
}

export interface TimeSlotFormData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  capacity: number;
}
