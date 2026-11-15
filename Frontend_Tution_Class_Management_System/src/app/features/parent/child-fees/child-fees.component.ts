import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { FeeInvoiceResponse, PaymentResponse } from '../../../core/models/fee.models';
import { saveBlob } from '../../../core/utils/download.utils';

@Component({
  selector: 'app-child-fees',
  templateUrl: './child-fees.component.html'
})
export class ChildFeesComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  invoices: FeeInvoiceResponse[] = [];
  loading = true;
  loadError = false;
  invoicePayments = new Map<number, PaymentResponse[]>();
  loadingPaymentsFor = new Set<number>();
  expandedInvoiceId: number | null = null;
  downloadingId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private parentPortalService: ParentPortalService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.studentId = Number(params.get('id'));
      this.child = null;
      this.invoicePayments.clear();
      this.expandedInvoiceId = null;
      this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.parentPortalService.fees(this.studentId).subscribe({
      next: (invoices) => {
        // Unpaid first, then newest period first.
        const order: Record<string, number> = { OVERDUE: 0, PARTIAL: 1, DUE: 2, PAID: 3 };
        this.invoices = invoices.sort((a, b) => (order[a.status] - order[b.status]) || b.period.localeCompare(a.period));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  get totals(): { due: number; paid: number; balance: number } {
    const due = this.invoices.reduce((s, i) => s + i.amountDue, 0);
    const paid = this.invoices.reduce((s, i) => s + i.amountPaid, 0);
    return { due, paid, balance: Math.max(0, due - paid) };
  }

  get overdueCount(): number {
    return this.invoices.filter((i) => i.status === 'OVERDUE').length;
  }

  balanceOf(invoice: FeeInvoiceResponse): number {
    return Math.max(0, invoice.amountDue - invoice.amountPaid);
  }

  toggleInvoice(invoice: FeeInvoiceResponse): void {
    if (this.expandedInvoiceId === invoice.id) {
      this.expandedInvoiceId = null;
      return;
    }
    this.expandedInvoiceId = invoice.id;
    if (!this.invoicePayments.has(invoice.id)) {
      this.loadingPaymentsFor.add(invoice.id);
      this.parentPortalService.paymentsForInvoice(this.studentId, invoice.id).subscribe({
        next: (payments) => {
          this.loadingPaymentsFor.delete(invoice.id);
          this.invoicePayments.set(invoice.id, payments);
        },
        error: () => {
          this.loadingPaymentsFor.delete(invoice.id);
          this.toastr.error('Could not load payments for this invoice');
        }
      });
    }
  }

  paymentsFor(invoiceId: number): PaymentResponse[] {
    return this.invoicePayments.get(invoiceId) ?? [];
  }

  downloadReceipt(payment: PaymentResponse): void {
    this.downloadingId = payment.id;
    this.parentPortalService.downloadReceipt(payment.id).subscribe({
      next: (blob) => {
        this.downloadingId = null;
        saveBlob(blob, `${payment.receiptNumber}.pdf`);
      },
      error: () => {
        this.downloadingId = null;
        this.toastr.error('Could not download receipt');
      }
    });
  }
}
