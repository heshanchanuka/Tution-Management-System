import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TeacherResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.scss']
})
export class TeacherListComponent implements OnInit {

  teachers: TeacherResponse[] = [];
  page = 0;
  totalPages = 0;
  searchTerm = '';
  loading = false;

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
    this.teacherService.list(this.page, 10, this.searchTerm).subscribe({
      next: (result) => {
        this.teachers = result.content;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load teachers');
      }
    });
  }

  search(): void {
    this.page = 0;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  delete(teacher: TeacherResponse): void {
    if (!this.confirmService.confirm(`Remove teacher "${teacher.fullName}"? This cannot be undone.`)) {
      return;
    }
    this.teacherService.delete(teacher.id).subscribe({
      next: () => {
        this.toastr.success('Teacher removed');
        this.load();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Could not remove teacher');
      }
    });
  }
}
