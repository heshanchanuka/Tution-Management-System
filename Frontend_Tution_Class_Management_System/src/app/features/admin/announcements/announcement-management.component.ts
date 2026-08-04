import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { ClassService } from '../../../core/services/class.service';
import { AnnouncementResponse } from '../../../core/models/announcement.models';
import { ClassResponse } from '../../../core/models/admin.models';
import { ConfirmService } from '../../../shared/services/confirm.service';

@Component({
  selector: 'app-announcement-management',
  templateUrl: './announcement-management.component.html',
  styleUrls: ['./announcement-management.component.scss']
})
export class AnnouncementManagementComponent implements OnInit {

  form: FormGroup;
  submitting = false;
  classes: ClassResponse[] = [];

  announcements: AnnouncementResponse[] = [];
  page = 0;
  totalPages = 0;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private classService: ClassService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      targetClassId: [null]
    });
  }

  ngOnInit(): void {
    this.classService.listAll().subscribe((result) => (this.classes = result.content));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.announcementService.list(this.page, 10).subscribe({
      next: (result) => {
        this.announcements = result.content;
        this.totalPages = result.totalPages;
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = { ...this.form.value, expiresAt: null };
    this.announcementService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset({ targetClassId: null });
        this.toastr.success('Announcement posted');
        this.page = 0;
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Could not post announcement');
      }
    });
  }

  delete(announcement: AnnouncementResponse): void {
    if (!this.confirmService.confirm(`Delete announcement "${announcement.title}"?`)) {
      return;
    }
    this.announcementService.delete(announcement.id).subscribe({
      next: () => {
        this.toastr.success('Announcement deleted');
        this.load();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not delete announcement')
    });
  }
}
