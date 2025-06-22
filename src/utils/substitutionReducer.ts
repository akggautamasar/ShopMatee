
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

const generateTeacherScheduleFromTimetable = (teachers: Teacher[], classes: ClassSchedule[], periods: string[]): Teacher[] => {
  const updatedTeachers = teachers.map(teacher => {
    const newSchedule: { [day: string]: { [period: string]: string } } = {};
    
    // Initialize all periods as FREE
    DAYS.forEach(day => {
      newSchedule[day] = {};
      periods.forEach(period => {
        newSchedule[day][period] = 'FREE';
      });
    });
    
    // Find classes where this teacher is assigned
    classes.forEach(classItem => {
      DAYS.forEach(day => {
        periods.forEach(period => {
          const periodData = classItem.schedule[day]?.[period];
          if (periodData && periodData.teacher.toLowerCase() === teacher.name.toLowerCase()) {
            newSchedule[day][period] = classItem.className;
          }
        });
      });
    });
    
    return {
      ...teacher,
      schedule: newSchedule
    };
  });
  
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
      return {
        ...state,
        teachers: generateTeacherScheduleFromTimetable(state.teachers, state.classes, state.periods)
      };
    default:
      return state;
  }
};
