
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Staff, AttendanceRecord, StaffState, StaffAction } from '@/types/staff';
import { staffReducer, initialStaffState } from '@/utils/staffReducer';
import { staffOperations, attendanceOperations } from '@/services/staffDatabase';

// Re-export types for backward compatibility
export type { Staff, AttendanceRecord };

const StaffContext = createContext<{
  state: StaffState;
  dispatch: React.Dispatch<StaffAction>;
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => Promise<void>;
  updateStaff: (staff: Staff) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  markAttendance: (attendance: Omit<AttendanceRecord, 'id'>) => Promise<void>;
} | null>(null);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(staffReducer, initialStaffState);
  const { user } = useAuth();

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadStaffData();
      loadAttendanceData();
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_STAFF', payload: [] });
      dispatch({ type: 'SET_ATTENDANCE', payload: [] });
    }
  }, [user]);

  const loadStaffData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const staff = await staffOperations.loadStaff();
      dispatch({ type: 'SET_STAFF', payload: staff });
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAttendanceData = async () => {
    try {
      const attendance = await attendanceOperations.loadAttendance();
      dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const addStaff = async (staffData: Omit<Staff, 'id' | 'createdAt'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      const newStaff = await staffOperations.addStaff(staffData, user.id);
      dispatch({ type: 'ADD_STAFF', payload: newStaff });
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  };

  const updateStaff = async (staff: Staff) => {
    try {
      await staffOperations.updateStaff(staff);
      dispatch({ type: 'UPDATE_STAFF', payload: staff });
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      await staffOperations.deleteStaff(staffId);
      dispatch({ type: 'DELETE_STAFF', payload: staffId });
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  };

  const markAttendance = async (attendanceData: Omit<AttendanceRecord, 'id'>) => {
    try {
      const attendance = await attendanceOperations.markAttendance(attendanceData);
      dispatch({ type: 'MARK_ATTENDANCE', payload: attendance });
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  return (
    <StaffContext.Provider value={{
      state,
      dispatch,
      addStaff,
      updateStaff,
      deleteStaff,
      markAttendance,
    }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
