import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorPasswordMatcher } from 'src/app/errorMatchers/error-password.matcher';
import { UserPasswordReset } from 'src/app/models/user-password-reset.model';
import { AuthService } from 'src/app/services/auth.service';
import validator from 'validator';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  private model: UserPasswordReset;
  isModelValid: boolean = false;
  private subscription: Subscription;
  processed = false;
  successfull = false;
  message_response = '';
  passwordMatcher = new ErrorPasswordMatcher();

  constructor(private route: ActivatedRoute,
              private authService: AuthService) { }

  ngOnInit() {
    let userId = this.route.snapshot.queryParams["userId"];
    let confirmationCode: string = this.route.snapshot.queryParams["confirmationCode"];

    if (userId && confirmationCode) {
      this.isModelValid = /^\d+$/.test(userId) && validator.isUUID(confirmationCode);
    }

    if (this.isModelValid) {
      this.model = {
        userId: Number(userId),
        confirmationCode: confirmationCode,
        password: ''
      } as UserPasswordReset;
    } else {
      this.processed = true;
      this.successfull = false;
      this.message_response = 'We were not able to validate your data, please, contact the support team.';
    }
  }

  onSubmit(form: NgForm) {
    const passwords = Object.assign({}, form.value);
    this.model.password = passwords.password;
    this.confirmUserRegistration();
  }
  
  confirmUserRegistration() {    
    this.subscription = this.authService
      .resetUserPassword(this.model).subscribe((response: any) => {
        this.successfull = response.ok;
        this.message_response = this.successfull ? response.data : response.message;
    }, error => {
      this.successfull = false;
      this.message_response = error;
    }, () => {
      this.processed = true;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
