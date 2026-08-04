import { Injectable } from '@angular/core';

/**
 * Stand-in for a styled confirmation modal: same call shape (`confirm(message)
 * -> boolean`), so list components don't change when this grows into a real
 * dialog component later.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  confirm(message: string): boolean {
    return window.confirm(message);
  }
}
