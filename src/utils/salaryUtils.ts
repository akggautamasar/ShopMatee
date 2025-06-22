
import { Staff, AttendanceRecord } from '../context/StaffContext';

export interface SalaryCalculation {
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalSalary: number;
}

export const calculateMonthlySalary = (
  staff: Staff,
  attendance: AttendanceRecord[],
  monthYear: string // Format: "YYYY-MM"
): SalaryCalculation => {
  const [year, month] = monthYear.split('-').map(Number);
  
  // Get all days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Filter attendance records for this staff and month
  const monthAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date);
    return (
      record.staffId === staff.id &&
      recordDate.getFullYear() === year &&
      recordDate.getMonth() === month - 1
    );
  });

  // Count different types of attendance
  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;

  // Create a map of attendance by date
  const attendanceMap = new Map();
  monthAttendance.forEach(record => {
    attendanceMap.set(record.date, record.status);
  });

  // Check each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = attendanceMap.get(dateStr) || 'absent';
    
    switch (status) {
      case 'present':
        presentDays++;
        break;
      case 'half-day':
        halfDays++;
        break;
      default:
        absentDays++;
        break;
    }
  }

  // Calculate total salary (half-day = 0.5 * daily wage)
  const totalSalary = (presentDays * staff.dailyWage) + (halfDays * staff.dailyWage * 0.5);

  return {
    presentDays,
    halfDays,
    absentDays,
    totalSalary,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const getAttendancePercentage = (presentDays: number, halfDays: number, totalDays: number): number => {
  const effectiveDays = presentDays + (halfDays * 0.5);
  return totalDays > 0 ? (effectiveDays / totalDays) * 100 : 0;
};
