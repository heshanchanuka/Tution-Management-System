import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-parent-list',
  templateUrl: './parent-list.component.html',
  styleUrls: ['./parent-list.component.scss']
})
export class ParentListComponent implements OnInit {

  parents: ParentResponse[] = [];
  page = 0;
  totalPages = 0;
  searchTerm = '';
  loading = false;

  constructor(
    private parentService: ParentService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.parentService.list(this.page, 10, this.searchTerm).subscribe({
      next: (result) => {
        this.parents = result.content;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load parents');
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

  delete(parent: ParentResponse): void {
    if (!this.confirmService.confirm(`Remove parent "${parent.fullName}"? This cannot be undone.`)) {
      return;
    }
    this.parentService.delete(parent.id).subscribe({
      next: () => {
        this.toastr.success('Parent removed');
        this.load();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Could not remove parent');
      }
    });
  }
}
