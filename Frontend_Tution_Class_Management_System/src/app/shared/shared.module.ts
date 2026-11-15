import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  AvatarComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  SkeletonListComponent,
  StatCardComponent,
  StatusBadgeComponent
} from './ui/ui-basics.components';
import {
  ConfirmDialogComponent,
  PaginationComponent,
  SearchInputComponent,
  ThemeToggleComponent
} from './ui/ui-interactive.components';
import { PortalLayoutComponent } from './layout/portal-layout.component';
import { AuthLayoutComponent, PublicHeaderComponent } from './layout/public-layout.components';
import { HumanizePipe, LkrPipe, PercentOfPipe, SchedulePipe, TimeAgoPipe } from './pipes/pipes';

const DECLARATIONS = [
  PageHeaderComponent,
  StatCardComponent,
  EmptyStateComponent,
  SkeletonListComponent,
  AvatarComponent,
  StatusBadgeComponent,
  PaginationComponent,
  SearchInputComponent,
  ConfirmDialogComponent,
  ThemeToggleComponent,
  PortalLayoutComponent,
  PublicHeaderComponent,
  AuthLayoutComponent,
  LkrPipe,
  SchedulePipe,
  HumanizePipe,
  TimeAgoPipe,
  PercentOfPipe
];

/** UI kit, layouts and pipes used by every feature module. */
@NgModule({
  declarations: DECLARATIONS,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [...DECLARATIONS, CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class SharedModule {
}
