import { Component } from '@angular/core';
import { NavSection } from '../../../shared/layout/portal-layout.component';

@Component({
  selector: 'app-parent-shell',
  template: `
    <app-portal-layout [nav]="nav" portalName="Parent portal" homeLink="/parent/dashboard">
      <router-outlet></router-outlet>
    </app-portal-layout>
  `
})
export class ParentShellComponent {
  readonly nav: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'grid-1x2', link: '/parent/dashboard' },
        { label: 'My children', icon: 'people', link: '/parent/children' },
        { label: 'Announcements', icon: 'megaphone', link: '/parent/announcements' }
      ]
    }
  ];
}
