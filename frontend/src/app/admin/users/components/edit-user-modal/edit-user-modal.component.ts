import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule, MatOptionModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent {
  editUserForm: FormGroup;
  isSuperAdmin: boolean | null;

  constructor(
    public dialogRef: MatDialogRef<EditUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    const profile = this.authService.getUserProfile();
    this.isSuperAdmin = profile && profile.profile === 'superadmin';

    this.editUserForm = this.fb.group({
      name: [data.name, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      company: [data.company, Validators.required],
      profile: [{ value: data.profile, disabled: !this.isSuperAdmin }, Validators.required]
    });
  }

private profiles = [
  { name: 'admin', displayName: 'Admin' },
  { name: 'superadmin', displayName: 'Superadmin' },
  { name: 'user', displayName: 'User' }
];
  getProfiles() {
    return this.profiles;
  }
  private companies = [
    { name: 'maicao', displayName: 'Maicao' },
    { name: 'cruz_verde', displayName: 'Cruz Verde' },
    { name: 'gruman', displayName: 'Gruman' },
    { name: 'rotter_krauss', displayName: 'Rotter & Krauss' },
    { name: 'san_camilo', displayName: 'San Camilo' },
    { name: 'cruz_verde_vidrio', displayName: 'Cruz Verde Vidrio' },
    { name: 'mantenimiento', displayName: 'Cruz Verde Mantenimiento' },
    { name: 'clima', displayName: 'Cruz Verde Clima' }
  ];
  getCompanies() {
    return this.companies;
  }

  onSave(): void {
    if (this.editUserForm.valid) {
      this.dialogRef.close(this.editUserForm.getRawValue());
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
