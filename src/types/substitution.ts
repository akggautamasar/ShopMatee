
export interface Teacher {
  id: string;
  name: string;
  subject: string;
  post: string;
  contactNumber: string;
  schedule: {
    [day: string]: {
      [period: string]: string;
    };
  };
  photo_url?: string;
}

export interface PeriodEntry {
  subject: string;
  teacher: string;
  time: string;
  // New fields for multiple teachers/subjects
  additionalEntries?: {
    subject: string;
    teacher: string;
    type: 'split' | 'combined'; // split = same class different subjects, combined = multiple classes
    combinedClasses?: string[]; // for combined classes scenario
  }[];
}

export interface ClassSchedule {
  id: string;
  className: string;
  schedule: {
    [day: string]: {
      [period: string]: PeriodEntry;
    };
  };
}

export interface SubstitutionRecord {
  id: string;
  date: string;
  absentTeacher: string;
  period: string;
  originalClass: string;
  originalSubject: string;
  substituteTeacher: string;
  remarks?: string;
}

export interface SubstitutionState {
  teachers: Teacher[];
  classes: ClassSchedule[];
  substitutions: SubstitutionRecord[];
  periods: string[];
  timeSlots: string[];
  loading: boolean;
}

export type SubstitutionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TEACHERS'; payload: Teacher[] }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
  | { type: 'SET_CLASSES'; payload: ClassSchedule[] }
  | { type: 'ADD_CLASS'; payload: ClassSchedule }
  | { type: 'UPDATE_CLASS'; payload: ClassSchedule }
  | { type: 'DELETE_CLASS'; payload: string }
  | { type: 'SET_SUBSTITUTIONS'; payload: SubstitutionRecord[] }
  | { type: 'ADD_SUBSTITUTION'; payload: SubstitutionRecord }
  | { type: 'SET_PERIODS'; payload: string[] }
  | { type: 'ADD_PERIOD'; payload: string }
  | { type: 'SET_TIME_SLOTS'; payload: string[] }
  | { type: 'UPDATE_TIME_SLOT'; payload: { index: number; time: string } }
  | { type: 'SYNC_TEACHER_SCHEDULES' };
