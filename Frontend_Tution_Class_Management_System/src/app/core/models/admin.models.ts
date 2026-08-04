export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// --- Teacher ---
export interface TeacherCreateRequest {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  qualifications: string;
  subjectSpecialty: string;
}

export interface TeacherUpdateRequest {
  fullName: string;
  phone: string;
  qualifications: string;
  subjectSpecialty: string;
}

export interface TeacherResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  qualifications: string | null;
  subjectSpecialty: string | null;
  joinedDate: string;
}

// --- Parent ---
export interface ParentCreateRequest {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  occupation: string;
}

export interface ParentUpdateRequest {
  fullName: string;
  phone: string;
  address: string;
  occupation: string;
}

export interface ParentResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  occupation: string | null;
}

// --- Student ---
export interface StudentRequest {
  fullName: string;
  dateOfBirth: string;
  gradeLevel: string;
  parentId: number;
}

export interface StudentResponse {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gradeLevel: string;
  parentId: number;
  parentName: string;
}

// --- Class ---
export const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface ClassRequest {
  subject: string;
  gradeLevel: string;
  teacherId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  feeAmount: number;
  capacity: number;
}

export interface ClassResponse {
  id: number;
  subject: string;
  gradeLevel: string;
  teacherId: number;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  feeAmount: number;
  capacity: number;
  enrolledCount: number;
}
