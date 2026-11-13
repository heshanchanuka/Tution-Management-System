import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

type ParentTab = 'all' | 'pending';

@Component({
  selector: 'app-parent-list',
  templateUrl: './parent-list.component.html',
  styleUrls: ['./parent-list.component.scss']
})
export class ParentListComponent implements OnInit {

  activeTab: ParentTab = 'all';

  // All parents
  parents: ParentResponse[] = [];
  page = 0;
  totalPages = 0;
  searchTerm = '';
  loading = false;

  // Pending self-registrations
  pending: ParentResponse[] = [];
  pendingPage = 0;
  pendingTotalPages = 0;
  pendingTotal = 0;
  loadingPending = false;
  /** Id of the pending row whose approve/reject request is in flight. */
  actingOnId: number | null = null;

  constructor(
    private parentService: ParentService,
    private confirmService: ConfirmService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('tab') === 'pending') {
      this.activeTab = 'pending';
    }
    this.load();
    this.loadPending();
  }

  selectTab(tab: ParentTab): void {
    this.activeTab = tab;
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
        if (!parent.enabled) {
          this.loadPending();
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Could not remove parent');
      }
    });
  }

  // --- Pending approvals ---

  loadPending(): void {
    this.loadingPending = true;
    this.parentService.getPending(this.pendingPage, 10).subscribe({
      next: (result) => {
        // If the last row on a later page was just handled, step back a page.
        if (result.content.length === 0 && this.pendingPage > 0) {
          this.pendingPage--;
          this.loadPending();
          return;
        }
        this.pending = result.content;
        this.pendingTotalPages = result.totalPages;
        this.pendingTotal = result.totalElements;
        this.loadingPending = false;
      },
      error: () => {
        this.loadingPending = false;
        this.toastr.error('Could not load pending registrations');
      }
    });
  }

  onPendingPageChange(page: number): void {
    this.pendingPage = page;
    this.loadPending();
  }

  approve(parent: ParentResponse): void {
    this.actingOnId = parent.id;
    this.parentService.approve(parent.id).subscribe({
      next: () => {
        this.actingOnId = null;
        this.toastr.success(`${parent.fullName} can now sign in`, 'Parent approved');
        this.loadPending();
        this.load();
      },
      error: (err) => {
        this.actingOnId = null;
        this.toastr.error(err?.error?.message ?? 'Could not approve parent');
      }
    });
  }

  reject(parent: ParentResponse): void {
    if (!this.confirmService.confirm(
      `Reject the registration from "${parent.fullName}" (${parent.username})? The account will be deleted.`)) {
      return;
    }
    this.actingOnId = parent.id;
    this.parentService.reject(parent.id).subscribe({
      next: () => {
        this.actingOnId = null;
        this.toastr.success('Registration rejected');
        this.loadPending();
        this.load();
      },
      error: (err) => {
        this.actingOnId = null;
        this.toastr.error(err?.error?.message ?? 'Could not reject registration');
      }
    });
  }
}
