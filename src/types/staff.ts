
export interface Staff {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
  post: string;
  workplace: string;
  dailyWage: number;
  createdAt: Date;
  photo_url?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: 'present' | 'absent' | 'half-day';
}

export interface StaffState {
  staff: Staff[];
  attendance: AttendanceRecord[];
  loading: boolean;
}

export type StaffAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STAFF'; payload: Staff[] }
  | { type: 'SET_ATTENDANCE'; payload: AttendanceRecord[] }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: Staff }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'MARK_ATTENDANCE'; payload: AttendanceRecord };
