import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TeacherResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html'
})
export class TeacherListComponent implements OnInit {

  teachers: TeacherResponse[] = [];
  page = 0;
  readonly pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  loading = true;
  loadError = false;

  constructor(
    private teacherService: TeacherService,
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
    this.teacherService.list(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.teachers = result.content;
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

  async delete(teacher: TeacherResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Remove ${teacher.fullName}?`,
      message: 'Their account will be deleted and they will no longer be able to sign in. This cannot be undone.',
      confirmText: 'Remove teacher'
    });
    if (!ok) {
      return;
    }
    this.teacherService.delete(teacher.id).subscribe({
      next: () => {
        this.toastr.success(`${teacher.fullName} was removed`);
        if (this.teachers.length === 1 && this.page > 0) {
          this.page--;
        }
        this.load();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not remove teacher')
    });
  }
}
