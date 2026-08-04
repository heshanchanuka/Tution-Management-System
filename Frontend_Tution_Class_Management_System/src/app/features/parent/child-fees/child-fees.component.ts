import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentPortalService } from '../../../core/services/parent-portal.service';
import { StudentResponse } from '../../../core/models/admin.models';
import { FeeInvoiceResponse, PaymentResponse } from '../../../core/models/fee.models';

@Component({
  selector: 'app-child-fees',
  templateUrl: './child-fees.component.html',
  styleUrls: ['./child-fees.component.scss']
})
export class ChildFeesComponent implements OnInit {

  studentId!: number;
  child: StudentResponse | null = null;
  invoices: FeeInvoiceResponse[] = [];
  loading = true;
  invoicePayments = new Map<number, PaymentResponse[]>();
  expandedInvoiceId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private parentPortalService: ParentPortalService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.parentPortalService.getChild(this.studentId).subscribe((child) => (this.child = child));

    this.parentPortalService.fees(this.studentId).subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message ?? 'Could not load fee invoices');
      }
    });
  }

  toggleInvoice(invoice: FeeInvoiceResponse): void {
    if (this.expandedInvoiceId === invoice.id) {
      this.expandedInvoiceId = null;
      return;
    }
    this.expandedInvoiceId = invoice.id;
    if (!this.invoicePayments.has(invoice.id)) {
      this.parentPortalService.paymentsForInvoice(this.studentId, invoice.id).subscribe((payments) => {
        this.invoicePayments.set(invoice.id, payments);
      });
    }
  }

  paymentsFor(invoiceId: number): PaymentResponse[] {
    return this.invoicePayments.get(invoiceId) ?? [];
  }

  downloadReceipt(payment: PaymentResponse): void {
    this.parentPortalService.downloadReceipt(payment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${payment.receiptNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toastr.error('Could not download receipt')
    });
  }
}
