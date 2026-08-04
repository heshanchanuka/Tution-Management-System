export interface AdminStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  monthlyRevenue: number;
  todayAttendanceRate: number;
}

export interface TeacherStatsResponse {
  totalClasses: number;
  totalStudents: number;
  classesToday: number;
}

export interface ParentStatsResponse {
  totalChildren: number;
  totalOutstandingBalance: number;
  overallAttendanceRate: number;
}

export interface RevenueReportPoint {
  month: string;
  totalAmount: number;
}

export interface AttendanceSummaryResponse {
  present: number;
  absent: number;
  late: number;
}

export interface ExamPerformancePoint {
  classId: number;
  subject: string;
  averagePercentage: number;
}
