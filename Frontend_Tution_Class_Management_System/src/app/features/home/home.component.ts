import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { dashboardFor } from '../../shared/layout/public-layout.components';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  readonly year = new Date().getFullYear();

  readonly previewStats = [
    { label: 'Students', value: '248', trend: '8%', tone: 'success' },
    { label: 'Attendance', value: '94%', trend: '2%', tone: 'success' },
    { label: 'Classes', value: '18', trend: '3 new', tone: 'primary' }
  ];

  readonly previewBars = [42, 55, 48, 70, 62, 84, 78, 92];

  readonly features = [
    { icon: 'calendar2-check', tone: 'success', title: 'Attendance in seconds', text: 'Teachers mark a whole class with one tap per student - present, late or absent.' },
    { icon: 'journal-check', tone: 'primary', title: 'Exams & marks', text: 'Create exams, enter marks in a grid and let grades calculate themselves.' },
    { icon: 'receipt', tone: 'warning', title: 'Fees & receipts', text: 'Generate monthly invoices for a class, record payments and issue PDF receipts.' },
    { icon: 'graph-up-arrow', tone: 'info', title: 'Reports that matter', text: 'Revenue, attendance and exam performance charts for the institute.' },
    { icon: 'megaphone', tone: 'violet', title: 'Announcements', text: 'Post updates to everyone, or only to parents of a specific class.' },
    { icon: 'shield-lock', tone: 'danger', title: 'Private by design', text: 'Role-based access: parents only ever see their own children.' }
  ];

  readonly roles = [
    {
      icon: 'shield-lock', tone: 'primary', title: 'Institute admin',
      text: 'Run the whole institute from one dashboard.',
      points: ['Manage teachers, parents, students & classes', 'Approve parent registrations', 'Invoices, payments & defaulters', 'Revenue and attendance reports']
    },
    {
      icon: 'easel', tone: 'success', title: 'Teachers',
      text: 'Spend class time teaching, not on paperwork.',
      points: ['See today\'s classes at a glance', 'Mark and correct attendance', 'Create exams and enter marks', 'Class rosters with parent details']
    },
    {
      icon: 'people', tone: 'warning', title: 'Parents',
      text: 'Know how your child is doing - without a phone call.',
      points: ['Attendance history for each child', 'Exam results & report card PDF', 'Fee balance and payment receipts', 'Announcements from the institute']
    }
  ];

  readonly steps = [
    { title: 'Register online', text: 'Create your parent account with your contact details in under a minute.' },
    { title: 'Get approved', text: 'The institute verifies your account and links your children to it.' },
    { title: 'Stay in the loop', text: 'Sign in any time to see attendance, results, fees and announcements.' }
  ];

  constructor(public authService: AuthService) {
  }

  dashboardLink(roles: string[]): string {
    return dashboardFor(roles);
  }
}
