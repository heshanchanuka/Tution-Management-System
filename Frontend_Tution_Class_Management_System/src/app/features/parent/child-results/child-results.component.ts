import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { StudentResultResponse } from '../../../core/models/parent-portal.models';
import { safeFileName, saveBlob } from '../../../core/utils/download.utils';

interface SubjectSummary {
  subject: string;
  average: number;
  count: number;
}

@Component({
  selector: 'app-child-results',
  templateUrl: './child-results.component.html'
})
export class ChildResultsComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  results: StudentResultResponse[] = [];
  loading = true;
  loadError = false;
  downloadingReportCard = false;
  subjectFilter = '';

  constructor(
    private route: ActivatedRoute,
    private parentPortalService: ParentPortalService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.studentId = Number(params.get('id'));
      this.child = null;
      this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.parentPortalService.results(this.studentId).subscribe({
      next: (results) => {
        this.results = results.sort((a, b) => b.examDate.localeCompare(a.examDate));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  percent(r: StudentResultResponse): number {
    return r.maxMarks ? (r.marksObtained / r.maxMarks) * 100 : 0;
  }

  tone(p: number): string {
    if (p >= 75) {
      return 'success';
    }
    if (p >= 50) {
      return 'info';
    }
    if (p >= 35) {
      return 'warning';
    }
    return 'danger';
  }

  get visible(): StudentResultResponse[] {
    return this.subjectFilter ? this.results.filter((r) => r.subject === this.subjectFilter) : this.results;
  }

  get subjectSummaries(): SubjectSummary[] {
    const map = new Map<string, number[]>();
    this.results.forEach((r) => {
      const list = map.get(r.subject) ?? [];
      list.push(this.percent(r));
      map.set(r.subject, list);
    });
    return [...map.entries()]
      .map(([subject, list]) => ({ subject, count: list.length, average: list.reduce((s, v) => s + v, 0) / list.length }))
      .sort((a, b) => b.average - a.average);
  }

  get overallAverage(): number {
    return this.results.length ? this.results.reduce((s, r) => s + this.percent(r), 0) / this.results.length : 0;
  }

  get bestSubject(): SubjectSummary | null {
    return this.subjectSummaries[0] ?? null;
  }

  downloadReportCard(): void {
    this.downloadingReportCard = true;
    this.parentPortalService.downloadReportCard(this.studentId).subscribe({
      next: (blob) => {
        this.downloadingReportCard = false;
        saveBlob(blob, `report-card-${safeFileName(this.child?.fullName ?? String(this.studentId))}.pdf`);
      },
      error: () => {
        this.downloadingReportCard = false;
        this.toastr.error('Could not download the report card');
      }
    });
  }
}
