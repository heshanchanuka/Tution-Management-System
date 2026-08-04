import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../core/services/student.service';
import { StudentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {

  students: StudentResponse[] = [];
  page = 0;
  totalPages = 0;
  searchTerm = '';
  loading = false;

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
    this.studentService.list(this.page, 10, this.searchTerm).subscribe({
      next: (result) => {
        this.students = result.content;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load students');
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

  delete(student: StudentResponse): void {
    if (!this.confirmService.confirm(`Remove student "${student.fullName}"? This cannot be undone.`)) {
      return;
    }
    this.studentService.delete(student.id).subscribe({
      next: () => {
        this.toastr.success('Student removed');
        this.load();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Could not remove student');
      }
    });
  }
}
