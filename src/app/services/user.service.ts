import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class UserService {
  private baseUrl = environment.apiUrl + 'user/';
  private userSettings$: BehaviorSubject<User> = new BehaviorSubject({} as User);
  
  constructor(private http: HttpClient) { }

  registerUser(user: User) {
    return this.http.post(this.baseUrl + 'register', {...user, currencyId: user.currency.id});
  }
  
  get getUserSettings(): Observable<User> {
    return this.userSettings$.asObservable();
  }

  set setUserSettings(baseCurrency: User) {
      this.userSettings$.next(baseCurrency);
  }

  updateUserSettings(user: User) {
    const url = `${this.baseUrl}${user.id}/UpdateUserSettings`;
    const httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json'
    });
    const model = {
      currencyId: user.currency.id,
      stateTimeZoneid: user.stateTimeZone.id
    };

    return this.http.put(url, model, { headers: httpHeaders, observe: 'response' });
  }
}