import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {

  @Input() page = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  goTo(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) {
      return;
    }
    this.pageChange.emit(page);
  }
}
