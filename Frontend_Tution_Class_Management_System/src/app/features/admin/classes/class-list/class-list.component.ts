import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from '../../../../core/services/class.service';
import { ClassResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html'
})
export class ClassListComponent implements OnInit {

  classes: ClassResponse[] = [];
  page = 0;
  readonly pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  loading = true;
  loadError = false;

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
    this.loadError = false;
    this.classService.list(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.classes = result.content;
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

  fillTone(cls: ClassResponse): string {
    const ratio = cls.capacity ? cls.enrolledCount / cls.capacity : 0;
    if (ratio >= 1) {
      return 'bg-danger';
    }
    if (ratio >= .8) {
      return 'bg-warning';
    }
    return 'bg-success';
  }

  async delete(schoolClass: ClassResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Delete ${schoolClass.subject} (${schoolClass.gradeLevel})?`,
      message: 'The class and its enrolments will be removed. Classes with attendance, exams or invoices may not be deletable.',
      confirmText: 'Delete class'
    });
    if (!ok) {
      return;
    }
    this.classService.delete(schoolClass.id).subscribe({
      next: () => {
        this.toastr.success('Class deleted');
        if (this.classes.length === 1 && this.page > 0) {
          this.page--;
        }
        this.load();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not delete class')
    });
  }
}
