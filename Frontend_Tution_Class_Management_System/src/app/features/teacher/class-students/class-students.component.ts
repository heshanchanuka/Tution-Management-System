import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-class-students',
  templateUrl: './class-students.component.html',
  styleUrls: ['./class-students.component.scss']
})
export class ClassStudentsComponent implements OnInit {

  classId!: number;
  schoolClass: ClassResponse | null = null;
  students: StudentResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private teacherClassService: TeacherClassService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.teacherClassService.getClass(this.classId).subscribe((cls) => (this.schoolClass = cls));
    this.teacherClassService.roster(this.classId).subscribe({
      next: (students) => (this.students = students),
      error: (err) => this.toastr.error(err?.error?.message ?? 'Could not load roster')
    });
  }
}
