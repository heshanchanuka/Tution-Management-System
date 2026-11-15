import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../../core/services/parent.service';
import { NavSection } from '../../../shared/layout/portal-layout.component';

@Component({
  selector: 'app-admin-shell',
  template: `
    <app-portal-layout [nav]="nav" portalName="Admin portal" homeLink="/admin/dashboard">
      <router-outlet></router-outlet>
    </app-portal-layout>
  `
})
export class AdminShellComponent implements OnInit {

  readonly nav: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'grid-1x2', link: '/admin/dashboard' }
      ]
    },
    {
      title: 'People',
      items: [
        { label: 'Students', icon: 'backpack', link: '/admin/students' },
        { label: 'Teachers', icon: 'easel', link: '/admin/teachers' },
        // The badge counts self-registered parents waiting for approval.
        { label: 'Parents', icon: 'people', link: '/admin/parents', badge$: this.parentService.pendingCount$ }
      ]
    },
    {
      title: 'Academics',
      items: [
        { label: 'Classes', icon: 'journal-bookmark', link: '/admin/classes' },
        { label: 'Announcements', icon: 'megaphone', link: '/admin/announcements' }
      ]
    },
    {
      title: 'Finance & insights',
      items: [
        { label: 'Fees & payments', icon: 'wallet2', link: '/admin/fees' },
        { label: 'Reports', icon: 'bar-chart-line', link: '/admin/reports' }
      ]
    }
  ];

  constructor(private parentService: ParentService) {
  }

  ngOnInit(): void {
    this.parentService.refreshPendingCount();
  }
}
