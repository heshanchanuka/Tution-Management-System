import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FeeService } from '../../../core/services/fee.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassService } from '../../../core/services/class.service';
import { ClassResponse, StudentResponse } from '../../../core/models/admin.models';
import { FeeInvoiceResponse, PaymentResponse } from '../../../core/models/fee.models';
import { currentMonthIso, toLocalIsoDate, todayIso } from '../../../core/utils/date.utils';
import { saveBlob } from '../../../core/utils/download.utils';

type FeeTab = 'invoices' | 'generate' | 'overdue';

@Component({
  selector: 'app-fee-management',
  templateUrl: './fee-management.component.html'
})
export class FeeManagementComponent implements OnInit {

  activeTab: FeeTab = 'invoices';

  classes: ClassResponse[] = [];
  students: StudentResponse[] = [];
  loadingStudents = true;
  studentFilter = '';

  // Generate invoices
  generateForm: FormGroup;
  generating = false;
  lastGenerated: { count: number; className: string; period: string } | null = null;

  // Student invoices
  selectedStudent: StudentResponse | null = null;
  invoices: FeeInvoiceResponse[] = [];
  loadingInvoices = false;
  invoicePayments = new Map<number, PaymentResponse[]>();
  downloadingId: number | null = null;

  // Inline payment form for the invoice being paid
  payingInvoice: FeeInvoiceResponse | null = null;
  paymentForm: FormGroup;
  submittingPayment = false;

  // Overdue
  overdue: FeeInvoiceResponse[] = [];
  overduePage = 0;
  overdueTotalPages = 0;
  overdueTotal = 0;
  loadingOverdue = true;
  readonly pageSize = 10;

  readonly today = todayIso();
  readonly methods = [
    { value: 'CASH', label: 'Cash', icon: 'cash' },
    { value: 'CARD', label: 'Card', icon: 'credit-card' },
    { value: 'BANK_TRANSFER', label: 'Bank transfer', icon: 'bank' }
  ];

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private studentService: StudentService,
    private classService: ClassService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const due = new Date();
    due.setDate(due.getDate() + 14);

    this.generateForm = this.fb.group({
      classId: [null, Validators.required],
      period: [currentMonthIso(), Validators.required],
      dueDate: [toLocalIsoDate(due), Validators.required]
    });

    this.paymentForm = this.fb.group({
      amountPaid: [null, [Validators.required, Validators.min(0.01)]],
      paymentDate: [todayIso(), Validators.required],
      method: ['CASH', Validators.required]
    });
  }

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab') as FeeTab | null;
    if (tab === 'generate' || tab === 'overdue') {
      this.activeTab = tab;
    }

    this.classService.listAll().subscribe((result) => {
      this.classes = result.content.sort((a, b) => a.subject.localeCompare(b.subject));
    });
    this.studentService.listAll().subscribe({
      next: (result) => {
        this.students = result.content.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.loadingStudents = false;
        const studentId = Number(this.route.snapshot.queryParamMap.get('student'));
        const preselect = this.students.find((s) => s.id === studentId);
        if (preselect) {
          this.selectStudent(preselect);
        }
      },
      error: () => (this.loadingStudents = false)
    });
    this.loadOverdue();
  }

  selectTab(tab: FeeTab): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'invoices' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ---------------------------------------------------------------- students

  get filteredStudents(): StudentResponse[] {
    const term = this.studentFilter.trim().toLowerCase();
    return term
      ? this.students.filter((s) => s.fullName.toLowerCase().includes(term) || s.gradeLevel.toLowerCase().includes(term))
      : this.students;
  }

  selectStudent(student: StudentResponse): void {
    this.selectedStudent = student;
    this.payingInvoice = null;
    this.loadInvoicesForStudent();
  }

  get totals(): { due: number; paid: number; balance: number } {
    const due = this.invoices.reduce((s, i) => s + i.amountDue, 0);
    const paid = this.invoices.reduce((s, i) => s + i.amountPaid, 0);
    return { due, paid, balance: due - paid };
  }

  private loadInvoicesForStudent(): void {
    if (!this.selectedStudent) {
      this.invoices = [];
      return;
    }
    this.loadingInvoices = true;
    this.feeService.invoicesForStudent(this.selectedStudent.id, 0, 100).subscribe({
      next: (result) => {
        this.invoices = result.content.sort((a, b) => b.period.localeCompare(a.period));
        this.loadingInvoices = false;
        this.invoices.filter((i) => i.amountPaid > 0).forEach((invoice) => this.loadPayments(invoice.id));
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

  // ---------------------------------------------------------------- payments

  balanceOf(invoice: FeeInvoiceResponse): number {
    return Math.max(0, Math.round((invoice.amountDue - invoice.amountPaid) * 100) / 100);
  }

  openPaymentForm(invoice: FeeInvoiceResponse): void {
    this.payingInvoice = invoice;
    const remaining = this.balanceOf(invoice);
    this.paymentForm.reset({ amountPaid: remaining, paymentDate: todayIso(), method: 'CASH' });
    // The amount can't be more than what's left on the invoice.
    this.paymentForm.get('amountPaid')?.setValidators([
      Validators.required, Validators.min(0.01), maxAmountValidator(remaining)
    ]);
    this.paymentForm.get('amountPaid')?.updateValueAndValidity();
  }

  cancelPayment(): void {
    this.payingInvoice = null;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.payingInvoice) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.submittingPayment = true;
    const invoiceId = this.payingInvoice.id;
    const request = { invoiceId, ...this.paymentForm.value };
    this.feeService.recordPayment(request).subscribe({
      next: (payment) => {
        this.submittingPayment = false;
        this.payingInvoice = null;
        this.toastr.success(`Receipt ${payment.receiptNumber} is ready to download`, 'Payment recorded');
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
    this.downloadingId = payment.id;
    this.feeService.downloadReceipt(payment.id).subscribe({
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

  // ---------------------------------------------------------------- generate

  get selectedClass(): ClassResponse | undefined {
    return this.classes.find((c) => c.id === this.generateForm.value.classId);
  }

  generateInvoices(): void {
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }
    this.generating = true;
    const cls = this.selectedClass;
    this.feeService.generateInvoices(this.generateForm.value).subscribe({
      next: (created) => {
        this.generating = false;
        this.lastGenerated = {
          count: created.length,
          className: cls ? `${cls.subject} · ${cls.gradeLevel}` : 'the class',
          period: this.generateForm.value.period
        };
        if (created.length > 0) {
          this.toastr.success(`${created.length} invoice${created.length === 1 ? '' : 's'} created`);
        } else {
          this.toastr.info('Everyone in this class was already billed for this period.');
        }
        if (this.selectedStudent) {
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

  // ---------------------------------------------------------------- overdue

  loadOverdue(): void {
    this.loadingOverdue = true;
    this.feeService.overdueInvoices(this.overduePage, this.pageSize).subscribe({
      next: (result) => {
        this.overdue = result.content;
        this.overdueTotalPages = result.totalPages;
        this.overdueTotal = result.totalElements;
        this.loadingOverdue = false;
      },
      error: () => {
        this.loadingOverdue = false;
        this.toastr.error('Could not load overdue invoices');
      }
    });
  }

  onOverduePageChange(page: number): void {
    this.overduePage = page;
    this.loadOverdue();
  }

  /** From the overdue list, jump to that student's invoices to take a payment. */
  openStudentFromOverdue(invoice: FeeInvoiceResponse): void {
    const student = this.students.find((s) => s.id === invoice.studentId);
    if (student) {
      this.selectTab('invoices');
      this.selectStudent(student);
    }
  }

  daysOverdue(invoice: FeeInvoiceResponse): number {
    const due = new Date(invoice.dueDate + 'T00:00:00');
    return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
  }
}

function maxAmountValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value !== null && Number(control.value) > max + 0.0001 ? { maxAmount: { max } } : null;
}
