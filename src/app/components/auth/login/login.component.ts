import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private allSubscriptions: Subscription[] = [];

  constructor(private authService: AuthService, private commonService: CommonService) { }

  ngOnInit() {
    this.loginForm = this.createFormGroup();
  }

  createFormGroup() {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  createFormGroupWithBuilder(formBuilder: FormBuilder) {
    return formBuilder.group({
      email: 'loren@gmail.com',
      password: 'password'
    });
  }

  onLogin() {
    const result: any = Object.assign({}, this.loginForm.value);
    const loginSubscription = this.authService.login({ Email: result.email, Password: result.password});
    loginSubscription.add(() => {
      const user: User = JSON.parse(localStorage.getItem('user'));
      const loginHistorySubscription = this.commonService.createUserLoginHistory(
        {
          Email: result.email,
          UserId: user != null ? user.id : null,
          IsSuccessful: user != null ? true : false
        }).subscribe((response) => { console.log('User login history successfully created.'); });
      this.allSubscriptions.push(loginHistorySubscription);
    });
    this.allSubscriptions.push(loginSubscription);
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(s => { s.unsubscribe()});
  }
}
