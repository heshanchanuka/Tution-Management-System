import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentService } from '../../../../core/services/parent.service';

@Component({
  selector: 'app-parent-form',
  templateUrl: './parent-form.component.html',
  styleUrls: ['./parent-form.component.scss']
})
export class ParentFormComponent implements OnInit {

  form: FormGroup;
  isEditMode = false;
  parentId: number | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private parentService: ParentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullName: ['', Validators.required],
      phone: [''],
      address: [''],
      occupation: ['']
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.parentId = Number(idParam);
      this.form.get('username')?.clearValidators();
      this.form.get('password')?.clearValidators();
      this.form.get('username')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();

      this.parentService.get(this.parentId).subscribe((parent) => {
        this.form.patchValue(parent);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const request$ = this.isEditMode
      ? this.parentService.update(this.parentId!, this.form.value)
      : this.parentService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toastr.success(this.isEditMode ? 'Parent updated' : 'Parent created');
        this.router.navigate(['/admin/parents']);
      },
      error: (err) => {
        this.submitting = false;
        this.toastr.error(err?.error?.message ?? 'Something went wrong');
      }
    });
  }
}
