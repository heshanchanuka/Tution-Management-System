import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FeeService } from '../../../core/services/fee.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassService } from '../../../core/services/class.service';
import { StudentResponse, ClassResponse } from '../../../core/models/admin.models';
import { FeeInvoiceResponse, PaymentResponse } from '../../../core/models/fee.models';

@Component({
  selector: 'app-fee-management',
  templateUrl: './fee-management.component.html',
  styleUrls: ['./fee-management.component.scss']
})
export class FeeManagementComponent implements OnInit {

  classes: ClassResponse[] = [];
  students: StudentResponse[] = [];

  // Generate invoices form
  generateForm: FormGroup;
  generating = false;

  // Student invoice lookup
  selectedStudentId: number | null = null;
  invoices: FeeInvoiceResponse[] = [];
  loadingInvoices = false;

  // Inline payment form, keyed by invoice id currently being paid
  payingInvoiceId: number | null = null;
  paymentForm: FormGroup;
  submittingPayment = false;

  invoicePayments = new Map<number, PaymentResponse[]>();

  // Defaulters
  overdue: FeeInvoiceResponse[] = [];
  overduePage = 0;
  overdueTotalPages = 0;

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private studentService: StudentService,
    private classService: ClassService,
    private toastr: ToastrService
  ) {
    this.generateForm = this.fb.group({
      classId: [null, Validators.required],
      period: ['', Validators.required],
      dueDate: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      amountPaid: [null, [Validators.required, Validators.min(0.01)]],
      paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
      method: ['CASH', Validators.required]
    });
  }

  ngOnInit(): void {
    this.classService.listAll().subscribe((result) => (this.classes = result.content));
    this.studentService.listAll().subscribe((result) => (this.students = result.content));
    this.loadOverdue();
  }

  generateInvoices(): void {
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }
    this.generating = true;
    this.feeService.generateInvoices(this.generateForm.value).subscribe({
      next: (created) => {
        this.generating = false;
        this.toastr.success(`${created.length} invoice(s) generated (already-billed students were skipped)`);
        if (this.selectedStudentId) {
          this.loadInvoicesForStudent();
        }
        this.loadOverdue();
      },
      error: (err) => {
        this.generating = false;
        this.toastr.error(err?.error?.message ?? 'Could not generate invoices');
      }
    });
  }

  onStudentSelected(): void {
    this.payingInvoiceId = null;
    this.loadInvoicesForStudent();
  }

  private loadInvoicesForStudent(): void {
    if (!this.selectedStudentId) {
      this.invoices = [];
      return;
    }
    this.loadingInvoices = true;
    this.feeService.invoicesForStudent(this.selectedStudentId, 0, 50).subscribe({
      next: (result) => {
        this.invoices = result.content;
        this.loadingInvoices = false;
        this.invoices.forEach((invoice) => this.loadPayments(invoice.id));
      },
      error: () => {
        this.loadingInvoices = false;
        this.toastr.error('Could not load invoices for this student');
      }
    });
  }

  private loadPayments(invoiceId: number): void {
    this.feeService.paymentsForInvoice(invoiceId).subscribe((payments) => {
      this.invoicePayments.set(invoiceId, payments);
    });
  }

  paymentsFor(invoiceId: number): PaymentResponse[] {
    return this.invoicePayments.get(invoiceId) ?? [];
  }

  openPaymentForm(invoice: FeeInvoiceResponse): void {
    this.payingInvoiceId = invoice.id;
    const remaining = invoice.amountDue - invoice.amountPaid;
    this.paymentForm.reset({
      amountPaid: remaining,
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'CASH'
    });
  }

  cancelPayment(): void {
    this.payingInvoiceId = null;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.payingInvoiceId) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.submittingPayment = true;
    const request = { invoiceId: this.payingInvoiceId, ...this.paymentForm.value };
    this.feeService.recordPayment(request).subscribe({
      next: () => {
        this.submittingPayment = false;
        this.toastr.success('Payment recorded');
        this.payingInvoiceId = null;
        this.loadInvoicesForStudent();
        this.loadOverdue();
      },
      error: (err) => {
        this.submittingPayment = false;
        this.toastr.error(err?.error?.message ?? 'Could not record payment');
      }
    });
  }

  downloadReceipt(payment: PaymentResponse): void {
    this.feeService.downloadReceipt(payment.id).subscribe({
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

  loadOverdue(): void {
    this.feeService.overdueInvoices(this.overduePage, 10).subscribe({
      next: (result) => {
        this.overdue = result.content;
        this.overdueTotalPages = result.totalPages;
      },
      error: () => this.toastr.error('Could not load overdue invoices')
    });
  }

  onOverduePageChange(page: number): void {
    this.overduePage = page;
    this.loadOverdue();
  }
}
