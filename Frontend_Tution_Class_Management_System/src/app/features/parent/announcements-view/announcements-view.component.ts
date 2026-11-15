import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { AnnouncementResponse } from '../../../core/models/announcement.models';

@Component({
  selector: 'app-announcements-view',
  templateUrl: './announcements-view.component.html'
})
export class AnnouncementsViewComponent implements OnInit {

  announcements: AnnouncementResponse[] = [];
  loading = true;
  filter: 'all' | 'class' | 'everyone' = 'all';

  constructor(private announcementService: AnnouncementService, private toastr: ToastrService) {
  }

  get visible(): AnnouncementResponse[] {
    if (this.filter === 'class') {
      return this.announcements.filter((a) => !!a.targetClassId);
    }
    if (this.filter === 'everyone') {
      return this.announcements.filter((a) => !a.targetClassId);
    }
    return this.announcements;
  }

  ngOnInit(): void {
    this.announcementService.relevantForParent().subscribe({
      next: (announcements) => {
        this.announcements = announcements.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load announcements');
      }
    });
  }

  isNew(a: AnnouncementResponse): boolean {
    return Date.now() - new Date(a.postedAt).getTime() < 3 * 86400000;
  }
}
