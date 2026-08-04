import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ExamService } from '../../../core/services/exam.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { ExamResponse, ExamResultResponse } from '../../../core/models/teacher-portal.models';

interface MarkRow {
  student: StudentResponse;
  marksObtained: number | null;
  remarks: string;
}

@Component({
  selector: 'app-marks-entry',
  templateUrl: './marks-entry.component.html',
  styleUrls: ['./marks-entry.component.scss']
})
export class MarksEntryComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  exams: ExamResponse[] = [];
  roster: StudentResponse[] = [];

  selectedExam: ExamResponse | null = null;
  rows: MarkRow[] = [];
  savingResults = false;

  showNewExamForm = false;
  examForm: FormGroup;
  creatingExam = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private teacherClassService: TeacherClassService,
    private examService: ExamService,
    private toastr: ToastrService
  ) {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      examDate: ['', Validators.required],
      maxMarks: [100, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.teacherClassService.roster(this.classId).subscribe((students) => (this.roster = students));
    this.loadExams();
  }

  loadExams(): void {
    this.examService.examsForClass(this.classId).subscribe((exams) => (this.exams = exams));
  }

  createExam(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.creatingExam = true;
    this.examService.create({ classId: this.classId, ...this.examForm.value }).subscribe({
      next: () => {
        this.creatingExam = false;
        this.showNewExamForm = false;
        this.examForm.reset({ maxMarks: 100 });
        this.toastr.success('Exam created');
        this.loadExams();
      },
      error: (err) => {
        this.creatingExam = false;
        this.toastr.error(err?.error?.message ?? 'Could not create exam');
      }
    });
  }

  openExam(exam: ExamResponse): void {
    this.selectedExam = exam;
    this.examService.getResults(exam.id).subscribe((results) => {
      const byStudent = new Map(results.map((r) => [r.studentId, r]));
      this.rows = this.roster.map((student) => {
        const existing: ExamResultResponse | undefined = byStudent.get(student.id);
        return {
          student,
          marksObtained: existing ? existing.marksObtained : null,
          remarks: existing?.remarks ?? ''
        };
      });
    });
  }

  closeExam(): void {
    this.selectedExam = null;
    this.rows = [];
  }

  saveResults(): void {
    if (!this.selectedExam) {
      return;
    }
    const entries = this.rows
      .filter((row) => row.marksObtained !== null)
      .map((row) => ({ studentId: row.student.id, marksObtained: row.marksObtained!, remarks: row.remarks }));

    if (entries.length === 0) {
      this.toastr.error('Enter at least one mark before saving');
      return;
    }

    this.savingResults = true;
    this.examService.saveResults(this.selectedExam.id, { entries }).subscribe({
      next: () => {
        this.savingResults = false;
        this.toastr.success('Marks saved');
      },
      error: (err) => {
        this.savingResults = false;
        this.toastr.error(err?.error?.message ?? 'Could not save marks');
      }
    });
  }
}
