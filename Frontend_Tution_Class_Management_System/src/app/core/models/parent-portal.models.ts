export interface StudentResultResponse {
  examId: number;
  examName: string;
  subject: string;
  examDate: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string | null;
}
