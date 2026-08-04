import { Component, OnInit } from '@angular/core';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-children',
  templateUrl: './my-children.component.html',
  styleUrls: ['./my-children.component.scss']
})
export class MyChildrenComponent implements OnInit {

  children: StudentResponse[] = [];
  loading = true;

  constructor(private parentPortalService: ParentPortalService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.parentPortalService.myChildren().subscribe({
      next: (children) => {
        this.children = children;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Could not load your children');
      }
    });
  }
}
