import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { ClassResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent implements OnInit {

  classes: ClassResponse[] = [];
  page = 0;
  totalPages = 0;
  searchTerm = '';
  loading = false;

  constructor(
    private classService: ClassService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.classService.list(this.page, 10, this.searchTerm).subscribe({
      next: (result) => {
        this.classes = result.content;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load classes');
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

  delete(schoolClass: ClassResponse): void {
    if (!this.confirmService.confirm(`Delete class "${schoolClass.subject} - ${schoolClass.gradeLevel}"? This cannot be undone.`)) {
      return;
    }
    this.classService.delete(schoolClass.id).subscribe({
      next: () => {
        this.toastr.success('Class deleted');
        this.load();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Could not delete class');
      }
    });
  }
}
