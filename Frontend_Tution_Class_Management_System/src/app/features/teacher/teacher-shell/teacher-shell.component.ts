import { Component } from '@angular/core';
import { NavSection } from '../../../shared/layout/portal-layout.component';

@Component({
  selector: 'app-teacher-shell',
  template: `
    <app-portal-layout [nav]="nav" portalName="Teacher portal" homeLink="/teacher/dashboard">
      <router-outlet></router-outlet>
    </app-portal-layout>
  `
})
export class TeacherShellComponent {
  readonly nav: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'grid-1x2', link: '/teacher/dashboard' },
        { label: 'My classes', icon: 'journal-bookmark', link: '/teacher/classes' }
      ]
    }
  ];
}
