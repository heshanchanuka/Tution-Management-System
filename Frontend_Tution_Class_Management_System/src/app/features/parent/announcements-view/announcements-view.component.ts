import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { AnnouncementResponse } from '../../../core/models/announcement.models';

@Component({
  selector: 'app-announcements-view',
  templateUrl: './announcements-view.component.html',
  styleUrls: ['./announcements-view.component.scss']
})
export class AnnouncementsViewComponent implements OnInit {

  announcements: AnnouncementResponse[] = [];
  loading = true;

  constructor(private announcementService: AnnouncementService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.announcementService.relevantForParent().subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load announcements');
      }
    });
  }
}
