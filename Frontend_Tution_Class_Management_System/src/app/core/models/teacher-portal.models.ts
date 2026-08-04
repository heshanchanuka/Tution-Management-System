export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceEntry {
  studentId: number;
  status: AttendanceStatus;
}

export interface MarkAttendanceRequest {
  date: string;
  entries: AttendanceEntry[];
}

export interface UpdateAttendanceStatusRequest {
  status: AttendanceStatus;
}

export interface AttendanceResponse {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  subject: string;
  date: string;
  status: AttendanceStatus;
}

export interface ExamCreateRequest {
  classId: number;
  name: string;
  examDate: string;
  maxMarks: number;
}

export interface ExamResponse {
  id: number;
  name: string;
  classId: number;
  subject: string;
  examDate: string;
  maxMarks: number;
}

export interface MarkEntryRequest {
  studentId: number;
  marksObtained: number;
  remarks?: string;
}

export interface BulkMarksRequest {
  entries: MarkEntryRequest[];
}

export interface ExamResultResponse {
  id: number;
  examId: number;
  studentId: number;
  studentName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string | null;
}
