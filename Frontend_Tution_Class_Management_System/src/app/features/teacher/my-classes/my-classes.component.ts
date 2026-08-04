import { Component, OnInit } from '@angular/core';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-classes',
  templateUrl: './my-classes.component.html',
  styleUrls: ['./my-classes.component.scss']
})
export class MyClassesComponent implements OnInit {

  classes: ClassResponse[] = [];
  loading = true;

  constructor(private teacherClassService: TeacherClassService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.teacherClassService.myClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load your classes');
      }
    });
  }
}
