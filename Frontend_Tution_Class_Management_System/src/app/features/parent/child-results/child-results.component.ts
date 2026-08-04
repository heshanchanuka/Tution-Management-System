import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { StudentResultResponse } from '../../../core/models/parent-portal.models';

@Component({
  selector: 'app-child-results',
  templateUrl: './child-results.component.html',
  styleUrls: ['./child-results.component.scss']
})
export class ChildResultsComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  results: StudentResultResponse[] = [];
  loading = true;
  downloadingReportCard = false;

  constructor(
    private route: ActivatedRoute,
    private parentPortalService: ParentPortalService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));

    this.parentPortalService.results(this.studentId).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load exam results');
      }
    });
  }

  downloadReportCard(): void {
    this.downloadingReportCard = true;
    this.parentPortalService.downloadReportCard(this.studentId).subscribe({
      next: (blob) => {
        this.downloadingReportCard = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-card-${this.child?.fullName ?? this.studentId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloadingReportCard = false;
        this.toastr.error('Could not download report card');
      }
    });
  }
}
