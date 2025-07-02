
import { SubstitutionState, SubstitutionAction, Teacher, ClassSchedule } from '@/types/substitution';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const initialState: SubstitutionState = {
  teachers: [],
  classes: [],
  substitutions: [],
  periods: ['1', '2', '3', '4', '5', '6', '7', '8'],
  timeSlots: ['8:15-9:00', '9:00-9:25', '9:25-10:00', '10:00-10:15', '10:15-10:45', '10:45-11:30', '11:30-12:30', '1:05-1:40'],
  loading: false
};

// Helper function to normalize teacher names for better matching
const normalizeTeacherName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

// Enhanced helper function to check if two teacher names match
const teacherNamesMatch = (teacherName: string, timetableName: string): boolean => {
  const normalizedTeacher = normalizeTeacherName(teacherName);
  const normalizedTimetable = normalizeTeacherName(timetableName);
  
  // Exact match
  if (normalizedTeacher === normalizedTimetable) return true;
  
  // Split names into parts
  const teacherParts = normalizedTeacher.split(' ').filter(part => part.length > 1);
  const timetableParts = normalizedTimetable.split(' ').filter(part => part.length > 1);
  
  // Check if any significant part matches (for cases like "NEHA SHARMA" vs "RAHUL SHARMA")
  // This is a flexible matching that allows for name corrections
  const commonParts = teacherParts.filter(part => 
    timetableParts.some(tPart => 
      part.includes(tPart) || tPart.includes(part) || 
      // Check for similar surnames or first names
      (part.length > 3 && tPart.length > 3 && 
       (part.substring(0, 3) === tPart.substring(0, 3) || 
        part.substring(-3) === tPart.substring(-3)))
    )
  );
  
  // If we have common parts, consider it a match
  if (commonParts.length > 0) return true;
  
  // Check if one name is contained within the other
  if (normalizedTeacher.includes(normalizedTimetable) || normalizedTimetable.includes(normalizedTeacher)) {
    return true;
  }
  
  return false;
};

// Function to find best matching teacher for a timetable entry
const findBestMatchingTeacher = (teachers: Teacher[], timetableTeacherName: string): Teacher | null => {
  // First try exact match
  let exactMatch = teachers.find(teacher => 
    normalizeTeacherName(teacher.name) === normalizeTeacherName(timetableTeacherName)
  );
  
  if (exactMatch) return exactMatch;
  
  // Then try partial matches
  const partialMatches = teachers.filter(teacher => 
    teacherNamesMatch(teacher.name, timetableTeacherName)
  );
  
  if (partialMatches.length === 1) {
    console.log(`Found partial match: "${timetableTeacherName}" matched with "${partialMatches[0].name}"`);
    return partialMatches[0];
  }
  
  if (partialMatches.length > 1) {
    console.log(`Multiple matches found for "${timetableTeacherName}":`, partialMatches.map(t => t.name));
    // Return the first match if multiple found
    return partialMatches[0];
  }
  
  // If no match found, log it
  console.log(`No match found for timetable teacher: "${timetableTeacherName}"`);
  console.log('Available teachers:', teachers.map(t => t.name));
  
  return null;
};

const generateTeacherScheduleFromTimetable = (teachers: Teacher[], classes: ClassSchedule[], periods: string[]): Teacher[] => {
  console.log('Starting enhanced teacher schedule sync...');
  console.log('Teachers:', teachers.map(t => t.name));
  console.log('Classes:', classes.length);
  
  const updatedTeachers = teachers.map(teacher => {
    const newSchedule: { [day: string]: { [period: string]: string } } = {};
    
    // Initialize all periods as FREE
    DAYS.forEach(day => {
      newSchedule[day] = {};
      periods.forEach(period => {
        newSchedule[day][period] = 'FREE';
      });
    });
    
    return {
      ...teacher,
      schedule: newSchedule
    };
  });
  
  // Track assignments for logging
  const assignmentLog: { [teacherName: string]: string[] } = {};
  
  // Process each class and assign teachers
  classes.forEach(classItem => {
    DAYS.forEach(day => {
      periods.forEach(period => {
        const periodData = classItem.schedule[day]?.[period];
        if (periodData) {
          // Handle primary teacher
          if (periodData.teacher) {
            const matchingTeacher = findBestMatchingTeacher(teachers, periodData.teacher);
            
            if (matchingTeacher) {
              const teacherIndex = updatedTeachers.findIndex(t => t.id === matchingTeacher.id);
              if (teacherIndex !== -1) {
                updatedTeachers[teacherIndex].schedule[day][period] = classItem.className;
                
                if (!assignmentLog[matchingTeacher.name]) {
                  assignmentLog[matchingTeacher.name] = [];
                }
                assignmentLog[matchingTeacher.name].push(
                  `${day} P${period}: ${classItem.className} (${periodData.subject})`
                );
              }
            }
          }

          // Handle additional teachers
          if (periodData.additionalEntries) {
            periodData.additionalEntries.forEach(additionalEntry => {
              if (additionalEntry.teacher) {
                const matchingTeacher = findBestMatchingTeacher(teachers, additionalEntry.teacher);
                
                if (matchingTeacher) {
                  const teacherIndex = updatedTeachers.findIndex(t => t.id === matchingTeacher.id);
                  if (teacherIndex !== -1) {
                    // For combined classes, show all involved classes
                    let classInfo = classItem.className;
                    if (additionalEntry.type === 'combined' && additionalEntry.combinedClasses) {
                      classInfo = [classItem.className, ...additionalEntry.combinedClasses].join('+');
                    }
                    
                    // If teacher already has an assignment, combine them
                    const currentAssignment = updatedTeachers[teacherIndex].schedule[day][period];
                    if (currentAssignment !== 'FREE') {
                      updatedTeachers[teacherIndex].schedule[day][period] = `${currentAssignment}+${classInfo}`;
                    } else {
                      updatedTeachers[teacherIndex].schedule[day][period] = classInfo;
                    }
                    
                    if (!assignmentLog[matchingTeacher.name]) {
                      assignmentLog[matchingTeacher.name] = [];
                    }
                    assignmentLog[matchingTeacher.name].push(
                      `${day} P${period}: ${classInfo} (${additionalEntry.subject})`
                    );
                  }
                }
              }
            });
          }
        }
      });
    });
  });
  
  // Log all assignments
  console.log('Teacher assignments:');
  Object.entries(assignmentLog).forEach(([teacherName, assignments]) => {
    console.log(`${teacherName}: ${assignments.length} assignments`);
    assignments.forEach(assignment => console.log(`  - ${assignment}`));
  });
  
  console.log('Enhanced teacher schedule sync completed');
  return updatedTeachers;
};

export const substitutionReducer = (state: SubstitutionState, action: SubstitutionAction): SubstitutionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TEACHERS':
      return { ...state, teachers: action.payload };
    case 'ADD_TEACHER':
      return { ...state, teachers: [...state.teachers, action.payload] };
    case 'UPDATE_TEACHER':
      return { ...state, teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TEACHER':
      return { ...state, teachers: state.teachers.filter(t => t.id !== action.payload) };
    case 'SET_CLASSES':
      return { ...state, classes: action.payload };
    case 'ADD_CLASS':
      return { ...state, classes: [...state.classes, action.payload] };
    case 'UPDATE_CLASS':
      const updatedState = { ...state, classes: state.classes.map(c => c.id === action.payload.id ? action.payload : c) };
      return updatedState;
    case 'DELETE_CLASS':
      return { ...state, classes: state.classes.filter(c => c.id !== action.payload) };
    case 'SET_SUBSTITUTIONS':
      return { ...state, substitutions: action.payload };
    case 'ADD_SUBSTITUTION':
      return { ...state, substitutions: [...state.substitutions, action.payload] };
    case 'SET_PERIODS':
      return { ...state, periods: action.payload };
    case 'ADD_PERIOD':
      return { ...state, periods: [...state.periods, action.payload] };
    case 'SET_TIME_SLOTS':
      return { ...state, timeSlots: action.payload };
    case 'UPDATE_TIME_SLOT':
      const newTimeSlots = [...state.timeSlots];
      newTimeSlots[action.payload.index] = action.payload.time;
      return { ...state, timeSlots: newTimeSlots };
    case 'SYNC_TEACHER_SCHEDULES':
      console.log('SYNC_TEACHER_SCHEDULES action triggered with enhanced matching');
      return {
        ...state,
        teachers: generateTeacherScheduleFromTimetable(state.teachers, state.classes, state.periods)
      };
    default:
      return state;
  }
};
