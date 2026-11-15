import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ExamService } from '../../../core/services/exam.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { ExamResponse, ExamResultResponse } from '../../../core/models/teacher-portal.models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { todayIso } from '../../../core/utils/date.utils';

interface MarkRow {
  student: StudentResponse;
  marksObtained: number | null;
  remarks: string;
  /** Grade returned by the server for already-saved marks. */
  grade: string | null;
}

@Component({
  selector: 'app-marks-entry',
  templateUrl: './marks-entry.component.html'
})
export class MarksEntryComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  exams: ExamResponse[] = [];
  loadingExams = true;

  selectedExam: ExamResponse | null = null;
  rows: MarkRow[] = [];
  loadingRows = false;
  savingResults = false;
  private savedSnapshot = '';

  showNewExamForm = false;
  examForm: FormGroup;
  creatingExam = false;
  readonly today = todayIso();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private host: ElementRef<HTMLElement>,
    private teacherClassService: TeacherClassService,
    private examService: ExamService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      examDate: [todayIso(), Validators.required],
      maxMarks: [100, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.loadExams();
  }

  // ------------------------------------------------------------ exams

  loadExams(): void {
    this.loadingExams = true;
    this.examService.examsForClass(this.classId).subscribe({
      next: (exams) => {
        this.exams = exams.sort((a, b) => b.examDate.localeCompare(a.examDate));
        this.loadingExams = false;
      },
      error: () => (this.loadingExams = false)
    });
  }

  createExam(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }
    this.creatingExam = true;
    this.examService.create({ classId: this.classId, ...this.examForm.value }).subscribe({
      next: (exam) => {
        this.creatingExam = false;
        this.showNewExamForm = false;
        this.examForm.reset({ name: '', examDate: todayIso(), maxMarks: 100 });
        this.toastr.success('Now enter the marks', `${exam.name} created`);
        this.loadExams();
        this.openExam(exam);
      },
      error: (err) => {
        this.creatingExam = false;
        this.toastr.error(err?.error?.message ?? 'Could not create exam');
      }
    });
  }

  openExam(exam: ExamResponse): void {
    this.selectedExam = exam;
    this.loadingRows = true;
    // Wait for both the roster and existing results so the grid is never built from a half-loaded roster.
    forkJoin({
      roster: this.teacherClassService.roster(this.classId),
      results: this.examService.getResults(exam.id)
    }).subscribe({
      next: ({ roster, results }) => {
        const byStudent = new Map<number, ExamResultResponse>(results.map((r) => [r.studentId, r]));
        this.rows = roster
          .sort((a, b) => a.fullName.localeCompare(b.fullName))
          .map((student) => {
            const existing = byStudent.get(student.id);
            return {
              student,
              marksObtained: existing ? existing.marksObtained : null,
              remarks: existing?.remarks ?? '',
              grade: existing?.grade ?? null
            };
          });
        this.savedSnapshot = this.snapshot();
        this.loadingRows = false;
      },
      error: (err) => {
        this.loadingRows = false;
        this.toastr.error(err?.error?.message ?? 'Could not load marks for this exam');
      }
    });
  }

  async closeExam(): Promise<void> {
    if (this.isDirty) {
      const ok = await this.confirmService.ask({
        title: 'Leave without saving?',
        message: 'You have marks that haven\'t been saved yet.',
        confirmText: 'Discard changes',
        tone: 'warning',
        icon: 'exclamation-triangle'
      });
      if (!ok) {
        return;
      }
    }
    this.selectedExam = null;
    this.rows = [];
  }

  // ------------------------------------------------------------ grid

  get isDirty(): boolean {
    return !!this.selectedExam && this.snapshot() !== this.savedSnapshot;
  }

  get enteredCount(): number {
    return this.rows.filter((r) => r.marksObtained !== null && (r.marksObtained as unknown) !== '').length;
  }

  get invalidCount(): number {
    return this.rows.filter((r) => this.isInvalid(r)).length;
  }

  get average(): number | null {
    const entered = this.rows.filter((r) => this.hasMark(r) && !this.isInvalid(r));
    if (!entered.length || !this.selectedExam) {
      return null;
    }
    const sum = entered.reduce((s, r) => s + Number(r.marksObtained), 0);
    return (sum / entered.length / this.selectedExam.maxMarks) * 100;
  }

  get highest(): MarkRow | null {
    return this.rows.filter((r) => this.hasMark(r) && !this.isInvalid(r))
      .reduce<MarkRow | null>((best, r) => (!best || Number(r.marksObtained) > Number(best.marksObtained) ? r : best), null);
  }

  hasMark(row: MarkRow): boolean {
    return row.marksObtained !== null && (row.marksObtained as unknown) !== '';
  }

  isInvalid(row: MarkRow): boolean {
    if (!this.hasMark(row) || !this.selectedExam) {
      return false;
    }
    const value = Number(row.marksObtained);
    return isNaN(value) || value < 0 || value > this.selectedExam.maxMarks;
  }

  percent(row: MarkRow): number | null {
    if (!this.hasMark(row) || this.isInvalid(row) || !this.selectedExam) {
      return null;
    }
    return (Number(row.marksObtained) / this.selectedExam.maxMarks) * 100;
  }

  percentTone(p: number | null): string {
    if (p === null) {
      return 'neutral';
    }
    if (p >= 75) {
      return 'success';
    }
    if (p >= 50) {
      return 'info';
    }
    if (p >= 35) {
      return 'warning';
    }
    return 'danger';
  }

  /** Enter moves to the next student's marks box - fast keyboard entry. */
  focusNext(index: number, event: Event): void {
    event.preventDefault();
    const inputs = this.host.nativeElement.querySelectorAll<HTMLInputElement>('input[data-mark]');
    const next = inputs.item(index + 1);
    if (next) {
      next.focus();
      next.select();
    }
  }

  saveResults(): void {
    if (!this.selectedExam) {
      return;
    }
    if (this.invalidCount > 0) {
      this.toastr.error(`Marks must be between 0 and ${this.selectedExam.maxMarks}.`, 'Check the highlighted marks');
      return;
    }
    const entries = this.rows
      .filter((row) => this.hasMark(row))
      .map((row) => ({ studentId: row.student.id, marksObtained: Number(row.marksObtained), remarks: row.remarks?.trim() || undefined }));

    if (entries.length === 0) {
      this.toastr.warning('Enter at least one mark before saving.');
      return;
    }

    this.savingResults = true;
    this.examService.saveResults(this.selectedExam.id, { entries }).subscribe({
      next: (results) => {
        this.savingResults = false;
        const gradeByStudent = new Map(results.map((r) => [r.studentId, r.grade]));
        this.rows.forEach((r) => (r.grade = gradeByStudent.get(r.student.id) ?? r.grade));
        this.savedSnapshot = this.snapshot();
        this.toastr.success(`${entries.length} mark${entries.length === 1 ? '' : 's'} saved`, 'Marks saved');
      },
      error: (err) => {
        this.savingResults = false;
        this.toastr.error(err?.error?.message ?? 'Could not save marks');
      }
    });
  }

  private snapshot(): string {
    return this.rows.map((r) => `${r.student.id}:${r.marksObtained ?? ''}:${r.remarks ?? ''}`).join('|');
  }
}
