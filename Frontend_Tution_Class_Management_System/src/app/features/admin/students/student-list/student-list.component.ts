import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../core/services/student.service';
import { StudentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {

  students: StudentResponse[] = [];
  page = 0;
  readonly pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  loading = true;
  loadError = false;

  constructor(
    private studentService: StudentService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.studentService.list(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.students = result.content;
        this.totalPages = result.totalPages;
        this.totalElements = result.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  search(term: string): void {
    this.searchTerm = term;
    this.page = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  /** Whole years since the date of birth, or null when unknown. */
  age(dateOfBirth: string | null): number | null {
    if (!dateOfBirth) {
      return null;
    }
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      years--;
    }
    return years >= 0 ? years : null;
  }

  async delete(student: StudentResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Remove ${student.fullName}?`,
      message: 'The student will be removed along with their class enrolments. This cannot be undone.',
      confirmText: 'Remove student'
    });
    if (!ok) {
      return;
    }
    this.studentService.delete(student.id).subscribe({
      next: () => {
        this.toastr.success(`${student.fullName} was removed`);
        if (this.students.length === 1 && this.page > 0) {
          this.page--;
        }
        this.load();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not remove student')
    });
  }
}
