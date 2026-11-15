import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { ClassService } from '../../../core/services/class.service';
import { AnnouncementCreateRequest, AnnouncementResponse } from '../../../core/models/announcement.models';
import { ClassResponse } from '../../../core/models/admin.models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { todayIso } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-announcement-management',
  templateUrl: './announcement-management.component.html'
})
export class AnnouncementManagementComponent implements OnInit {

  readonly titleMax = 120;
  readonly messageMax = 1000;
  readonly pageSize = 10;
  readonly today = todayIso();

  form: FormGroup;
  submitting = false;
  classes: ClassResponse[] = [];

  announcements: AnnouncementResponse[] = [];
  page = 0;
  totalPages = 0;
  totalElements = 0;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private classService: ClassService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(this.titleMax)]],
      message: ['', [Validators.required, Validators.maxLength(this.messageMax)]],
      targetClassId: [null],
      expiresOn: ['']
    });
  }

  get f() {
    return this.form.controls;
  }

  get targetClass(): ClassResponse | undefined {
    return this.classes.find((c) => c.id === this.form.value.targetClassId);
  }

  ngOnInit(): void {
    this.classService.listAll().subscribe((result) => {
      this.classes = result.content.sort((a, b) => a.subject.localeCompare(b.subject));
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.announcementService.list(this.page, this.pageSize).subscribe({
      next: (result) => {
        this.announcements = result.content;
        this.totalPages = result.totalPages;
        this.totalElements = result.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load announcements');
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  isExpired(a: AnnouncementResponse): boolean {
    return !!a.expiresAt && new Date(a.expiresAt).getTime() < Date.now();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const value = this.form.value;
    const payload: AnnouncementCreateRequest = {
      title: value.title.trim(),
      message: value.message.trim(),
      targetClassId: value.targetClassId,
      // Expire at the end of the chosen day (local time, sent as LocalDateTime).
      expiresAt: value.expiresOn ? `${value.expiresOn}T23:59:59` : null
    };
    this.announcementService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset({ title: '', message: '', targetClassId: null, expiresOn: '' });
        this.toastr.success(payload.targetClassId ? 'Parents of the class will see it' : 'Every parent will see it', 'Announcement posted');
        this.page = 0;
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Could not post announcement');
      }
    });
  }

  async delete(announcement: AnnouncementResponse): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'Delete this announcement?',
      message: `"${announcement.title}" will no longer be visible to parents.`,
      confirmText: 'Delete'
    });
    if (!ok) {
      return;
    }
    this.announcementService.delete(announcement.id).subscribe({
      next: () => {
        this.toastr.success('Announcement deleted');
        if (this.announcements.length === 1 && this.page > 0) {
          this.page--;
        }
        this.load();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not delete announcement')
    });
  }
}
