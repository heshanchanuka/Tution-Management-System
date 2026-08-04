import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const allowedRoles = route.data['roles'] as string[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      // Route is guarded only to require a login, no specific role needed.
      return true;
    }

    return this.authService.hasAnyRole(allowedRoles) ? true : this.router.createUrlTree(['/forbidden']);
  }
}
