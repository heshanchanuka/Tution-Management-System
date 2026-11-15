import { Component, OnInit } from '@angular/core';
import { TeacherClassService } from '../../../core/services/teacher-class.service';
import { ClassResponse } from '../../../core/models/admin.models';
import { todayDayName } from '../../../core/utils/date.utils';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

@Component({
  selector: 'app-my-classes',
  templateUrl: './my-classes.component.html'
})
export class MyClassesComponent implements OnInit {

  classes: ClassResponse[] = [];
  loading = true;
  loadError = false;
  filter = '';
  readonly todayName = todayDayName();

  constructor(private teacherClassService: TeacherClassService) {
  }

  get filtered(): ClassResponse[] {
    const term = this.filter.trim().toLowerCase();
    return this.classes
      .filter((c) => !term || c.subject.toLowerCase().includes(term) || c.gradeLevel.toLowerCase().includes(term))
      .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.teacherClassService.myClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }
}
