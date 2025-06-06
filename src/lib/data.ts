import type { Club, Enrollment, TimeSlot, User } from './types';
import { v4 as uuidv4 } from 'uuid'; // Needs: npm install uuid && npm install @types/uuid -D

// In-memory store
let clubs: Club[] = [
  {
    id: 'club1',
    name: 'Chess Club',
    description: 'Sharpen your mind with the ancient game of strategy. All levels welcome!',
    categoryIcon: 'Puzzle', // lucide-react icon name
    timeSlots: [
      { id: 'ts1-1', dayOfWeek: 'Monday', startTime: '16:00', endTime: '18:00', capacity: 20, enrolledCount: 5 },
      { id: 'ts1-2', dayOfWeek: 'Wednesday', startTime: '17:00', endTime: '19:00', capacity: 15, enrolledCount: 2 },
    ],
  },
  {
    id: 'club2',
    name: 'Debate Society',
    description: 'Engage in stimulating discussions and hone your public speaking skills.',
    categoryIcon: 'Mic',
    timeSlots: [
      { id: 'ts2-1', dayOfWeek: 'Tuesday', startTime: '18:00', endTime: '20:00', capacity: 25, enrolledCount: 10 },
      { id: 'ts2-2', dayOfWeek: 'Thursday', startTime: '18:00', endTime: '20:00', capacity: 25, enrolledCount: 0 },
    ],
  },
  {
    id: 'club3',
    name: 'Art & Painting Club',
    description: 'Unleash your creativity on canvas. Materials provided for beginners.',
    categoryIcon: 'Paintbrush',
    timeSlots: [
      { id: 'ts3-1', dayOfWeek: 'Friday', startTime: '15:00', endTime: '17:30', capacity: 12, enrolledCount: 12 },
    ],
  },
  {
    id: 'club4',
    name: 'Coding Ninjas',
    description: 'Collaborate on projects, learn new technologies, and prepare for hackathons.',
    categoryIcon: 'Code',
    timeSlots: [
      { id: 'ts4-1', dayOfWeek: 'Monday', startTime: '19:00', endTime: '21:00', capacity: 30, enrolledCount: 15 },
      { id: 'ts4-2', dayOfWeek: 'Wednesday', startTime: '19:00', endTime: '21:00', capacity: 30, enrolledCount: 28 },
      { id: 'ts4-3', dayOfWeek: 'Saturday', startTime: '10:00', endTime: '13:00', capacity: 20, enrolledCount: 0 },
    ],
  },
];

let enrollments: Enrollment[] = [
    { id: 'enr1', studentMatricula: '12345', studentFirstName: 'John', studentLastName: 'Doe', studentGroup: 'CS101', clubId: 'club1', timeSlotId: 'ts1-1', enrolledAt: new Date().toISOString() },
];


// --- Club Management ---
export async function getClubs(): Promise<Club[]> {
  return JSON.parse(JSON.stringify(clubs)); // Return deep copy
}

export async function getClubById(id: string): Promise<Club | undefined> {
  return JSON.parse(JSON.stringify(clubs.find(club => club.id === id)));
}

export async function addClub(clubData: Omit<Club, 'id' | 'timeSlots'> & { timeSlots?: Omit<TimeSlot, 'id' | 'enrolledCount'>[] }): Promise<Club> {
  const newClub: Club = {
    ...clubData,
    id: uuidv4(),
    timeSlots: (clubData.timeSlots || []).map(ts => ({ ...ts, id: uuidv4(), enrolledCount: 0 })),
  };
  clubs.push(newClub);
  return JSON.parse(JSON.stringify(newClub));
}

export async function updateClub(id: string, clubData: Partial<Omit<Club, 'id'>>): Promise<Club | null> {
  const clubIndex = clubs.findIndex(club => club.id === id);
  if (clubIndex === -1) return null;
  
  const updatedClub = { ...clubs[clubIndex], ...clubData };
  // Ensure timeSlots always have ids and enrolledCount if provided
  if (clubData.timeSlots) {
    updatedClub.timeSlots = clubData.timeSlots.map(ts => ({
      id: ts.id || uuidv4(),
      ...ts,
      enrolledCount: ts.enrolledCount || 0,
    }));
  }
  
  clubs[clubIndex] = updatedClub;
  return JSON.parse(JSON.stringify(updatedClub));
}

export async function deleteClub(id: string): Promise<boolean> {
  const initialLength = clubs.length;
  clubs = clubs.filter(club => club.id !== id);
  // Also remove associated enrollments
  enrollments = enrollments.filter(enr => enr.clubId !== id);
  return clubs.length < initialLength;
}

// --- Time Slot Management within a Club (simplified, part of updateClub) ---
// For more granular control, you'd have addTimeSlotToClub, removeTimeSlotFromClub, etc.
// Example: updateClub can receive a new timeSlots array.

// --- Enrollment Management ---
export async function getEnrollments(clubId?: string): Promise<Enrollment[]> {
  let filteredEnrollments = enrollments;
  if (clubId) {
    filteredEnrollments = enrollments.filter(enr => enr.clubId === clubId);
  }
  return JSON.parse(JSON.stringify(filteredEnrollments.map(e => {
    const club = clubs.find(c => c.id === e.clubId);
    const timeSlot = club?.timeSlots.find(ts => ts.id === e.timeSlotId);
    return {
      ...e,
      clubName: club?.name,
      dayOfWeek: timeSlot?.dayOfWeek,
      timeRange: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/A'
    }
  })));
}

export async function addEnrollment(enrollmentData: Omit<Enrollment, 'id' | 'enrolledAt'>): Promise<Enrollment | string> {
  const club = clubs.find(c => c.id === enrollmentData.clubId);
  if (!club) return "Club not found.";
  
  const timeSlot = club.timeSlots.find(ts => ts.id === enrollmentData.timeSlotId);
  if (!timeSlot) return "Time slot not found.";

  if (timeSlot.enrolledCount >= timeSlot.capacity) return "This time slot is full.";

  // Check if student is already enrolled in this specific timeslot
  const existingEnrollment = enrollments.find(e => 
    e.studentMatricula === enrollmentData.studentMatricula &&
    e.clubId === enrollmentData.clubId &&
    e.timeSlotId === enrollmentData.timeSlotId
  );
  if (existingEnrollment) return "Student already enrolled in this slot.";
  
  // Check if student is already enrolled in any other club at the same day and overlapping time
  // This is a more complex check, for now, we'll skip this for simplicity.
  // A real system would check for time conflicts across all club enrollments for the student.

  timeSlot.enrolledCount++;
  const newEnrollment: Enrollment = {
    ...enrollmentData,
    id: uuidv4(),
    enrolledAt: new Date().toISOString(),
  };
  enrollments.push(newEnrollment);
  return JSON.parse(JSON.stringify(newEnrollment));
}

export async function removeEnrollment(enrollmentId: string): Promise<boolean> {
  const enrollmentIndex = enrollments.findIndex(enr => enr.id === enrollmentId);
  if (enrollmentIndex === -1) return false;

  const enrollment = enrollments[enrollmentIndex];
  const club = clubs.find(c => c.id === enrollment.clubId);
  if (club) {
    const timeSlot = club.timeSlots.find(ts => ts.id === enrollment.timeSlotId);
    if (timeSlot && timeSlot.enrolledCount > 0) {
      timeSlot.enrolledCount--;
    }
  }
  
  enrollments.splice(enrollmentIndex, 1);
  return true;
}

// Helper to get student data by matricula (for pre-filling forms if user is logged in)
export async function getStudentDetailsByMatricula(matricula: string, loggedInUser: User | null): Promise<Partial<Enrollment> | null> {
    if (loggedInUser && loggedInUser.role === 'student' && loggedInUser.matricula === matricula) {
        return {
            studentMatricula: loggedInUser.matricula,
            studentFirstName: loggedInUser.name.split(' ')[0] || '', // simplistic split
            studentLastName: loggedInUser.name.split(' ').slice(1).join(' ') || '', // simplistic split
            studentGroup: loggedInUser.group || '',
        };
    }
    // In a real app, you might query a student database
    return null; 
}

// Initialize uuid - run `npm install uuid` and `npm install --save-dev @types/uuid`
// This is just to ensure the mock data functions work.
if (typeof window !== 'undefined') {
    // ensures uuid can be used if this file is imported client-side for types, though it's primarily server-side logic.
}
