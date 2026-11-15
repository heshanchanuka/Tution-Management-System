import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-class-students',
  templateUrl: './class-students.component.html'
})
export class ClassStudentsComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  students: StudentResponse[] = [];
  loading = true;
  loadError = false;
  filter = '';

  constructor(private route: ActivatedRoute, private teacherClassService: TeacherClassService) {
  }

  get filtered(): StudentResponse[] {
    const term = this.filter.trim().toLowerCase();
    return term
      ? this.students.filter((s) => s.fullName.toLowerCase().includes(term) || s.parentName?.toLowerCase().includes(term))
      : this.students;
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.teacherClassService.roster(this.classId).subscribe({
      next: (students) => {
        this.students = students.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }
}
