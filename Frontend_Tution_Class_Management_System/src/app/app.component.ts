import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <a class="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-primary" style="z-index: 2000" href="#main-content">Skip to content</a>
    <router-outlet></router-outlet>
    <app-confirm-dialog></app-confirm-dialog>
  `
})
export class AppComponent {
}
