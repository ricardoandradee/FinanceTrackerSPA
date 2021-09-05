import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UiService } from './ui.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CurrencyService } from './currency.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { UserValidation } from '../models/user-validation.model';
import { UserPasswordReset } from '../models/user-password-reset.model';

@Injectable()
export class AuthService {
  private baseUrl = environment.apiUrl + 'auth/';
  private jwtHelper = new JwtHelperService();
  private isAuth$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private existingUsersDetails$: BehaviorSubject<[]> = new BehaviorSubject([]);
  
  currentUser: User;
  decodedToken: any;
  constructor(private http: HttpClient,
              private uiService: UiService,
              private currencyService: CurrencyService,
              private userService: UserService,
              private router: Router) {
                  
                  this.getExistingUsersDetails().subscribe((response) => {
                    if (response.ok) {
                      const allUserDetails = response.body as [];
                      this.existingUsersDetails$.next(allUserDetails);
                    }
                  });
                }

  registerUser(user: User) {
    return this.http.post(this.baseUrl + 'register', {...user, currencyId: user.currency.id});
  }

  confirmUserRegistration(userValidation: UserValidation) {
    return this.http.post(this.baseUrl + 'confirmuserregistration', userValidation);
  }

  resetUserPassword(userValidation: UserPasswordReset) {
    return this.http.post(this.baseUrl + 'resetuserpassword', userValidation);
  }

  get getIsAuthenticated(): Observable<boolean> {
    return this.isAuth$.asObservable();
  }

  get allExistingUsersDetails(): Observable<[]> {
    return this.existingUsersDetails$.asObservable();
  }

  set setIsAuthenticated(isAuth: boolean) {
    this.isAuth$.next(isAuth);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currencyRates');
    this.decodedToken = null;
    this.uiService.showSnackBar('Logged out.', 3000);
    this.setIsAuthenticated = false;
    this.router.navigate(['/login']);
  }

  private getExistingUsersDetails(): Observable<HttpResponse<Object>> {
    const url = `${this.baseUrl}GetExistingUsersDetails`;
    return this.http.get(url, { observe: 'response' });
  }

  login(model: any) {
    const url = `${this.baseUrl}login`;
    const httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json'
    });
    
    return this.http.post(url, model, { headers: httpHeaders, observe: 'response' }).subscribe((response) => {
      if (response.ok) {
        const responseBody = response.body as any;
        if (responseBody.user.ok) {
          const user = responseBody.user.data as User;
          const userToken = responseBody.token;

          if (userToken) {
            localStorage.setItem('token', userToken);
            this.decodedToken = this.jwtHelper.decodeToken(userToken);
          }

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUser = user;
            this.currencyService.fetchListOfCurrencies();
            this.userService.setUserSettings = this.currentUser;
          }

          this.uiService.showSnackBar('Successfully logged in.', 3000);
          this.setIsAuthenticated = true;
          this.router.navigate(['/finance/income']);
        } else {
          this.uiService.showSnackBar(responseBody.user.message, 3000);
        }
      }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while processing login. Error code: ${err.status} - ${err.statusText}`, 3000);
    });
  }
}