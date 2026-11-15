import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentService } from '../../../../core/services/parent.service';
import { ParentResponse } from '../../../../core/models/admin.models';
import { ConfirmService } from '../../../../shared/services/confirm.service';

type ParentTab = 'all' | 'pending';

@Component({
  selector: 'app-parent-list',
  templateUrl: './parent-list.component.html'
})
export class ParentListComponent implements OnInit {

  activeTab: ParentTab = 'all';
  readonly pageSize = 10;

  // All parents
  parents: ParentResponse[] = [];
  page = 0;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  loading = true;
  loadError = false;

  // Pending self-registrations
  pending: ParentResponse[] = [];
  pendingPage = 0;
  pendingTotalPages = 0;
  pendingTotal = 0;
  loadingPending = true;
  /** Id of the pending row whose approve/reject request is in flight. */
  actingOnId: number | null = null;

  constructor(
    private parentService: ParentService,
    private confirmService: ConfirmService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
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
    // Keep the tab in the URL so refresh/back keeps the user where they were.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'pending' ? 'pending' : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.parentService.list(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.parents = result.content;
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

  async delete(parent: ParentResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Remove ${parent.fullName}?`,
      message: 'Their account will be deleted. Parents who still have students linked to them can\'t be removed.',
      confirmText: 'Remove parent'
    });
    if (!ok) {
      return;
    }
    this.parentService.delete(parent.id).subscribe({
      next: () => {
        this.toastr.success(`${parent.fullName} was removed`);
        if (this.parents.length === 1 && this.page > 0) {
          this.page--;
        }
        this.load();
        if (!parent.enabled) {
          this.loadPending();
        }
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not remove parent')
    });
  }

  // --- Pending approvals ---

  loadPending(): void {
    this.loadingPending = true;
    this.parentService.getPending(this.pendingPage, this.pageSize).subscribe({
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

  async reject(parent: ParentResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: `Reject ${parent.fullName}'s registration?`,
      message: `The account "${parent.username}" will be deleted and the username freed up. This cannot be undone.`,
      confirmText: 'Reject registration',
      icon: 'person-x'
    });
    if (!ok) {
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
