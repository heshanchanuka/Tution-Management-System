import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForbiddenComponent } from './shared/components/forbidden/forbidden.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [AuthGuard],
    data: { roles: ['TEACHER'] }
  },
  {
    path: 'parent',
    loadChildren: () => import('./features/parent/parent.module').then(m => m.ParentModule),
    canActivate: [AuthGuard],
    data: { roles: ['PARENT'] }
  },

  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
