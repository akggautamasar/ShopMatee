
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Teacher, ClassSchedule, SubstitutionRecord, SubstitutionState, SubstitutionAction } from '@/types/substitution';
import { substitutionReducer, initialState } from '@/utils/substitutionReducer';
import { teacherOperations, classOperations, substitutionOperations, settingsOperations } from '@/services/substitutionDatabase';

// Re-export types for backward compatibility
export type { Teacher, ClassSchedule, SubstitutionRecord };

const SubstitutionContext = createContext<{
  state: SubstitutionState;
  dispatch: React.Dispatch<SubstitutionAction>;
  syncTeacherSchedules: () => void;
  // Database operations
  loadTeachers: () => Promise<void>;
  saveTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  loadClasses: () => Promise<void>;
  saveClass: (classData: Omit<ClassSchedule, 'id'>) => Promise<void>;
  updateClass: (classData: ClassSchedule) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  loadSubstitutions: () => Promise<void>;
  saveSubstitutions: (substitutions: SubstitutionRecord[]) => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: (periods: string[], timeSlots: string[]) => Promise<void>;
} | null>(null);

export const SubstitutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(substitutionReducer, initialState);
  const { toast } = useToast();

  const syncTeacherSchedules = () => {
    dispatch({ type: 'SYNC_TEACHER_SCHEDULES' });
  };

  // Teacher operations
  const loadTeachers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const teachers = await teacherOperations.loadTeachers();
      dispatch({ type: 'SET_TEACHERS', payload: teachers });
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({ title: "Error", description: "Failed to load teachers", variant: "destructive" });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    try {
      const newTeacher = await teacherOperations.saveTeacher(teacher);
      dispatch({ type: 'ADD_TEACHER', payload: newTeacher });
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast({ title: "Error", description: "Failed to save teacher", variant: "destructive" });
    }
  };

  const updateTeacher = async (teacher: Teacher) => {
    try {
      await teacherOperations.updateTeacher(teacher);
      dispatch({ type: 'UPDATE_TEACHER', payload: teacher });
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({ title: "Error", description: "Failed to update teacher", variant: "destructive" });
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      await teacherOperations.deleteTeacher(id);
      dispatch({ type: 'DELETE_TEACHER', payload: id });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({ title: "Error", description: "Failed to delete teacher", variant: "destructive" });
    }
  };

  // Class operations
  const loadClasses = async () => {
    try {
      const classes = await classOperations.loadClasses();
      dispatch({ type: 'SET_CLASSES', payload: classes });
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({ title: "Error", description: "Failed to load classes", variant: "destructive" });
    }
  };

  const saveClass = async (classData: Omit<ClassSchedule, 'id'>) => {
    try {
      const newClass = await classOperations.saveClass(classData);
      dispatch({ type: 'ADD_CLASS', payload: newClass });
    } catch (error) {
      console.error('Error saving class:', error);
      toast({ title: "Error", description: "Failed to save class", variant: "destructive" });
    }
  };

  const updateClass = async (classData: ClassSchedule) => {
    try {
      await classOperations.updateClass(classData);
      dispatch({ type: 'UPDATE_CLASS', payload: classData });
    } catch (error) {
      console.error('Error updating class:', error);
      toast({ title: "Error", description: "Failed to update class", variant: "destructive" });
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await classOperations.deleteClass(id);
      dispatch({ type: 'DELETE_CLASS', payload: id });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({ title: "Error", description: "Failed to delete class", variant: "destructive" });
    }
  };

  // Substitution operations
  const loadSubstitutions = async () => {
    try {
      const substitutions = await substitutionOperations.loadSubstitutions();
      dispatch({ type: 'SET_SUBSTITUTIONS', payload: substitutions });
    } catch (error) {
      console.error('Error loading substitutions:', error);
      toast({ title: "Error", description: "Failed to load substitutions", variant: "destructive" });
    }
  };

  const saveSubstitutions = async (substitutions: SubstitutionRecord[]) => {
    try {
      await substitutionOperations.saveSubstitutions(substitutions);
      dispatch({ type: 'SET_SUBSTITUTIONS', payload: substitutions });
    } catch (error) {
      console.error('Error saving substitutions:', error);
      toast({ title: "Error", description: "Failed to save substitutions", variant: "destructive" });
    }
  };

  // Settings operations
  const loadSettings = async () => {
    try {
      const { periods, timeSlots } = await settingsOperations.loadSettings();
      dispatch({ type: 'SET_PERIODS', payload: periods });
      dispatch({ type: 'SET_TIME_SLOTS', payload: timeSlots });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (periods: string[], timeSlots: string[]) => {
    try {
      await settingsOperations.saveSettings(periods, timeSlots);
      dispatch({ type: 'SET_PERIODS', payload: periods });
      dispatch({ type: 'SET_TIME_SLOTS', payload: timeSlots });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadTeachers(),
        loadClasses(),
        loadSubstitutions(),
        loadSettings()
      ]);
    };

    loadInitialData();
  }, []);

  return (
    <SubstitutionContext.Provider value={{
      state,
      dispatch,
      syncTeacherSchedules,
      loadTeachers,
      saveTeacher,
      updateTeacher,
      deleteTeacher,
      loadClasses,
      saveClass,
      updateClass,
      deleteClass,
      loadSubstitutions,
      saveSubstitutions,
      loadSettings,
      saveSettings
    }}>
      {children}
    </SubstitutionContext.Provider>
  );
};

export const useSubstitution = () => {
  const context = useContext(SubstitutionContext);
  if (!context) {
    throw new Error('useSubstitution must be used within a SubstitutionProvider');
  }
  return context;
};
