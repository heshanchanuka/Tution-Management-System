import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  template: `
    <app-public-header></app-public-header>
    <section class="error-page">
      <div>
        <div class="error-code">404</div>
        <h1>We couldn't find that page</h1>
        <p>The link may be broken, or the page may have moved. Check the address or head back to somewhere familiar.</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <button type="button" class="btn btn-white" (click)="location.back()"><i class="bi bi-arrow-left"></i> Go back</button>
          <a class="btn btn-primary" routerLink="/home"><i class="bi bi-house"></i> Home page</a>
        </div>
      </div>
    </section>
  `
})
export class NotFoundComponent {
  constructor(public location: Location) {
  }
}
