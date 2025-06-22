
import { StaffState, StaffAction } from '@/types/staff';

export const initialStaffState: StaffState = {
  staff: [],
  attendance: [],
  loading: false,
};

export const staffReducer = (state: StaffState, action: StaffAction): StaffState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STAFF':
      return { ...state, staff: action.payload };
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload };
    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.payload] };
    case 'UPDATE_STAFF':
      return {
        ...state,
        staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_STAFF':
      return {
        ...state,
        staff: state.staff.filter(s => s.id !== action.payload),
        attendance: state.attendance.filter(a => a.staffId !== action.payload),
      };
    case 'MARK_ATTENDANCE':
      const existingIndex = state.attendance.findIndex(
        a => a.staffId === action.payload.staffId && a.date === action.payload.date
      );
      
      if (existingIndex >= 0) {
        const updatedAttendance = [...state.attendance];
        updatedAttendance[existingIndex] = action.payload;
        return { ...state, attendance: updatedAttendance };
      } else {
        return { ...state, attendance: [...state.attendance, action.payload] };
      }
    default:
      return state;
  }
};
