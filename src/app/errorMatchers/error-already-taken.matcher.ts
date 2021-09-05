import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

export class ErrorAlreadyTakenMatcher implements ErrorStateMatcher {
  constructor(private intems: string[]) { }
  isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
    const inputValue = control && control.value ? control.value.toString() : '';
    const isFormValid = control && control.dirty && control.touched && this.intems.indexOf(inputValue) > -1;

    if (isFormValid) {
      control.setErrors({ alreadyTaken: true });
    }

    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
