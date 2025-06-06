import type { Club, Enrollment, TimeSlot, User } from './types';
import { v4 as uuidv4 } from 'uuid'; 
import { DAYS_OF_WEEK } from './constants'; // Import translated days

// In-memory store
let clubs: Club[] = [
  {
    id: 'club1',
    name: 'Club de Ajedrez',
    description: '¡Agudiza tu mente con el antiguo juego de estrategia. Todos los niveles son bienvenidos!',
    categoryIcon: 'Puzzle', 
    timeSlots: [
      { id: 'ts1-1', dayOfWeek: 'Lunes', startTime: '16:00', endTime: '18:00', capacity: 20, enrolledCount: 5 },
      { id: 'ts1-2', dayOfWeek: 'Miércoles', startTime: '17:00', endTime: '19:00', capacity: 15, enrolledCount: 2 },
    ],
  },
  {
    id: 'club2',
    name: 'Sociedad de Debate',
    description: 'Participa en discusiones estimulantes y perfecciona tus habilidades de oratoria.',
    categoryIcon: 'Mic',
    timeSlots: [
      { id: 'ts2-1', dayOfWeek: 'Martes', startTime: '18:00', endTime: '20:00', capacity: 25, enrolledCount: 10 },
      { id: 'ts2-2', dayOfWeek: 'Jueves', startTime: '18:00', endTime: '20:00', capacity: 25, enrolledCount: 0 },
    ],
  },
  {
    id: 'club3',
    name: 'Club de Arte y Pintura',
    description: 'Desata tu creatividad en el lienzo. Se proporcionan materiales para principiantes.',
    categoryIcon: 'Paintbrush',
    timeSlots: [
      { id: 'ts3-1', dayOfWeek: 'Viernes', startTime: '15:00', endTime: '17:30', capacity: 12, enrolledCount: 12 },
    ],
  },
  {
    id: 'club4',
    name: 'Ninjas de la Programación',
    description: 'Colabora en proyectos, aprende nuevas tecnologías y prepárate para hackatones.',
    categoryIcon: 'Code',
    timeSlots: [
      { id: 'ts4-1', dayOfWeek: 'Lunes', startTime: '19:00', endTime: '21:00', capacity: 30, enrolledCount: 15 },
      { id: 'ts4-2', dayOfWeek: 'Miércoles', startTime: '19:00', endTime: '21:00', capacity: 30, enrolledCount: 28 },
      { id: 'ts4-3', dayOfWeek: 'Sábado', startTime: '10:00', endTime: '13:00', capacity: 20, enrolledCount: 0 },
    ],
  },
];

let enrollments: Enrollment[] = [
    { id: 'enr1', studentMatricula: '12345', studentFirstName: 'Juan', studentLastName: 'Pérez', studentGroup: 'CS101', clubId: 'club1', timeSlotId: 'ts1-1', enrolledAt: new Date().toISOString() },
];


// --- Club Management ---
export async function getClubs(): Promise<Club[]> {
  return JSON.parse(JSON.stringify(clubs)); 
}

export async function getClubById(id: string): Promise<Club | undefined> {
  return JSON.parse(JSON.stringify(clubs.find(club => club.id === id)));
}

export async function addClub(clubData: Omit<Club, 'id' | 'timeSlots'> & { timeSlots?: Omit<TimeSlot, 'id' | 'enrolledCount'>[] }): Promise<Club> {
  const newClub: Club = {
    ...clubData,
    id: uuidv4(),
    timeSlots: (clubData.timeSlots || []).map(ts => ({ ...ts, dayOfWeek: ts.dayOfWeek as DayOfWeek, id: uuidv4(), enrolledCount: 0 })),
  };
  clubs.push(newClub);
  return JSON.parse(JSON.stringify(newClub));
}

export async function updateClub(id: string, clubData: Partial<Omit<Club, 'id'>>): Promise<Club | null> {
  const clubIndex = clubs.findIndex(club => club.id === id);
  if (clubIndex === -1) return null;
  
  const updatedClub = { ...clubs[clubIndex], ...clubData };
  if (clubData.timeSlots) {
    updatedClub.timeSlots = clubData.timeSlots.map(ts => ({
      id: ts.id || uuidv4(),
      ...ts,
      dayOfWeek: ts.dayOfWeek as DayOfWeek,
      enrolledCount: ts.enrolledCount || 0,
    }));
  }
  
  clubs[clubIndex] = updatedClub;
  return JSON.parse(JSON.stringify(updatedClub));
}

export async function deleteClub(id: string): Promise<boolean> {
  const initialLength = clubs.length;
  clubs = clubs.filter(club => club.id !== id);
  enrollments = enrollments.filter(enr => enr.clubId !== id);
  return clubs.length < initialLength;
}


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
      timeRange: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/D'
    }
  })));
}

export async function addEnrollment(enrollmentData: Omit<Enrollment, 'id' | 'enrolledAt'>): Promise<Enrollment | string> {
  const club = clubs.find(c => c.id === enrollmentData.clubId);
  if (!club) return "Club no encontrado.";
  
  const timeSlot = club.timeSlots.find(ts => ts.id === enrollmentData.timeSlotId);
  if (!timeSlot) return "Horario no encontrado.";

  if (timeSlot.enrolledCount >= timeSlot.capacity) return "Este horario está lleno.";

  const existingEnrollment = enrollments.find(e => 
    e.studentMatricula === enrollmentData.studentMatricula &&
    e.clubId === enrollmentData.clubId &&
    e.timeSlotId === enrollmentData.timeSlotId
  );
  if (existingEnrollment) return "El estudiante ya está inscrito en este horario.";
  
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

export async function getStudentDetailsByMatricula(matricula: string, loggedInUser: User | null): Promise<Partial<Enrollment> | null> {
    if (loggedInUser && loggedInUser.role === 'student' && loggedInUser.matricula === matricula) {
        return {
            studentMatricula: loggedInUser.matricula,
            studentFirstName: loggedInUser.name.split(' ')[0] || '', 
            studentLastName: loggedInUser.name.split(' ').slice(1).join(' ') || '', 
            studentGroup: loggedInUser.group || '',
        };
    }
    return null; 
}

if (typeof window !== 'undefined') {
    // ensures uuid can be used if this file is imported client-side for types, though it's primarily server-side logic.
}
