import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent implements OnInit {

  /** Pending parent registrations; updated by ParentService whenever the pending list is fetched. */
  readonly pendingCount$ = this.parentService.pendingCount$;

  constructor(private parentService: ParentService) {
  }

  ngOnInit(): void {
    this.parentService.refreshPendingCount();
  }
}
