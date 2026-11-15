import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { dashboardFor } from '../../shared/layout/public-layout.components';

/** Keeps signed-in users away from the sign-in / register pages: sends them to their dashboard. */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return this.router.parseUrl(dashboardFor(this.authService.getUser()?.roles));
    }
    return true;
  }
}
