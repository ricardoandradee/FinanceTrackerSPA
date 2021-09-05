import { FormControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

export class ErrorPasswordMatcher implements ErrorStateMatcher {
  constructor() { }
  isErrorState(control: FormControl, form: NgForm): boolean {
    const passwords = Object.assign({}, form.value);
    const isFormValid = passwords.passwordConfirmation === passwords.password;

    if (!isFormValid) {
      control.setErrors({ doesNotMatch: true });
    }

    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
