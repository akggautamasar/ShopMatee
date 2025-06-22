
import { supabase } from '@/integrations/supabase/client';
import { Teacher, ClassSchedule, SubstitutionRecord } from '@/types/substitution';

export const teacherOperations = {
  async loadTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      subject: teacher.subject,
      post: teacher.post,
      contactNumber: teacher.contact_number,
      schedule: (teacher.schedule as { [day: string]: { [period: string]: string } }) || {},
      photo_url: teacher.photo_url || undefined,
    }));
  },

  async saveTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        name: teacher.name,
        subject: teacher.subject,
        post: teacher.post,
        contact_number: teacher.contactNumber,
        schedule: teacher.schedule,
        user_id: user.data.user?.id,
        photo_url: teacher.photo_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      post: data.post,
      contactNumber: data.contact_number,
      schedule: (data.schedule as { [day: string]: { [period: string]: string } }) || {},
      photo_url: data.photo_url || undefined,
    };
  },

  async updateTeacher(teacher: Teacher): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .update({
        name: teacher.name,
        subject: teacher.subject,
        post: teacher.post,
        contact_number: teacher.contactNumber,
        schedule: teacher.schedule,
        photo_url: teacher.photo_url || null,
      })
      .eq('id', teacher.id);

    if (error) throw error;
  },

  async deleteTeacher(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const classOperations = {
  async loadClasses(): Promise<ClassSchedule[]> {
    const { data, error } = await supabase
      .from('class_schedules')
      .select('*')
      .order('class_name');

    if (error) throw error;

    return data.map(cls => ({
      id: cls.id,
      className: cls.class_name,
      schedule: (cls.schedule as { [day: string]: { [period: string]: { subject: string; teacher: string; time: string } } }) || {}
    }));
  },

  async saveClass(classData: Omit<ClassSchedule, 'id'>): Promise<ClassSchedule> {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('class_schedules')
      .insert({
        class_name: classData.className,
        schedule: classData.schedule,
        user_id: user.data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      className: data.class_name,
      schedule: (data.schedule as { [day: string]: { [period: string]: { subject: string; teacher: string; time: string } } }) || {}
    };
  },

  async updateClass(classData: ClassSchedule): Promise<void> {
    const { error } = await supabase
      .from('class_schedules')
      .update({
        class_name: classData.className,
        schedule: classData.schedule
      })
      .eq('id', classData.id);

    if (error) throw error;
  },

  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const substitutionOperations = {
  async loadSubstitutions(): Promise<SubstitutionRecord[]> {
    const { data, error } = await supabase
      .from('substitution_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(sub => ({
      id: sub.id,
      date: sub.date,
      absentTeacher: sub.absent_teacher,
      period: sub.period,
      originalClass: sub.original_class || '',
      originalSubject: sub.original_subject || '',
      substituteTeacher: sub.substitute_teacher,
      remarks: sub.remarks || ''
    }));
  },

  async saveSubstitutions(substitutions: SubstitutionRecord[]): Promise<void> {
    if (substitutions.length > 0) {
      const date = substitutions[0].date;
      await supabase
        .from('substitution_records')
        .delete()
        .eq('date', date);
    }

    const user = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('substitution_records')
      .insert(
        substitutions.map(sub => ({
          date: sub.date,
          absent_teacher: sub.absentTeacher,
          period: sub.period,
          original_class: sub.originalClass,
          original_subject: sub.originalSubject,
          substitute_teacher: sub.substituteTeacher,
          remarks: sub.remarks,
          user_id: user.data.user?.id
        }))
      );

    if (error) throw error;
  }
};

export const settingsOperations = {
  async loadSettings(): Promise<{ periods: string[]; timeSlots: string[] }> {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      periods: (data?.periods as string[]) || ['1', '2', '3', '4', '5', '6', '7', '8'],
      timeSlots: (data?.time_slots as string[]) || ['8:15-9:00', '9:00-9:25', '9:25-10:00', '10:00-10:15', '10:15-10:45', '10:45-11:30', '11:30-12:30', '1:05-1:40']
    };
  },

  async saveSettings(periods: string[], timeSlots: string[]): Promise<void> {
    const user = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('school_settings')
      .upsert({
        user_id: user.data.user?.id,
        periods,
        time_slots: timeSlots
      });

    if (error) throw error;
  }
};
