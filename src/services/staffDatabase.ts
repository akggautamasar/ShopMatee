
import { supabase } from '@/integrations/supabase/client';
import { Staff, AttendanceRecord } from '@/types/staff';

export const staffOperations = {
  async loadStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      mobileNumber: item.mobile_number,
      address: item.address || undefined,
      post: item.post,
      workplace: item.workplace,
      dailyWage: parseFloat(item.daily_wage.toString()),
      createdAt: new Date(item.created_at),
      photo_url: item.photo_url || undefined,
    }));
  },

  async addStaff(staffData: Omit<Staff, 'id' | 'createdAt'>, userId: string): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        user_id: userId,
        name: staffData.name,
        mobile_number: staffData.mobileNumber,
        address: staffData.address || null,
        post: staffData.post,
        workplace: staffData.workplace,
        daily_wage: staffData.dailyWage,
        photo_url: staffData.photo_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      mobileNumber: data.mobile_number,
      address: data.address || undefined,
      post: data.post,
      workplace: data.workplace,
      dailyWage: parseFloat(data.daily_wage.toString()),
      createdAt: new Date(data.created_at),
      photo_url: data.photo_url || undefined,
    };
  },

  async updateStaff(staff: Staff): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .update({
        name: staff.name,
        mobile_number: staff.mobileNumber,
        address: staff.address || null,
        post: staff.post,
        workplace: staff.workplace,
        daily_wage: staff.dailyWage,
        updated_at: new Date().toISOString(),
        photo_url: staff.photo_url || null,
      })
      .eq('id', staff.id);

    if (error) throw error;
  },

  async deleteStaff(staffId: string): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (error) throw error;
  }
};

export const attendanceOperations = {
  async loadAttendance(): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      staffId: item.staff_id,
      date: item.date,
      status: item.status as 'present' | 'absent' | 'half-day',
    }));
  },

  async markAttendance(attendanceData: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    console.log('Marking attendance:', attendanceData);
    
    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        staff_id: attendanceData.staffId,
        date: attendanceData.date,
        status: attendanceData.status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'staff_id,date',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Attendance saved successfully:', data);

    return {
      id: data.id,
      staffId: data.staff_id,
      date: data.date,
      status: data.status as 'present' | 'absent' | 'half-day',
    };
  }
};
