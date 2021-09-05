import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Currency } from '../models/currency.model';
import { TimeZone } from '../models/timezone.model';

@Injectable()
export class CommonService {
    private baseUrl = environment.apiUrl + 'financetracker/';
    private currencyDataSource$: BehaviorSubject<Currency[]> = new BehaviorSubject([]);
    private timeZoneDataSource$: BehaviorSubject<TimeZone[]> = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
        this.loadCurrencies();
        this.loadTimeZones();
    }
    
    private loadCurrencies() {
        const url = `${this.baseUrl}GetListOfCurrency`;
        return this.http.get(url, { observe: 'response' })
        .pipe(map(response => {
            return (response.body as Currency[]).sort((a, b) => (a.code > b.code) ? 1 : -1);
        })).subscribe((currencies: Currency[]) => {
            this.currencyDataSource$.next(currencies);
        });
    }
    
    get getAllCurrencies(): Observable<Currency[]> {
        return this.currencyDataSource$.asObservable();
    }

    get getAllTimezones(): Observable<TimeZone[]> {
        return this.timeZoneDataSource$.asObservable();
    }
  
    createUserLoginHistory(model: any) {
        const url = `${this.baseUrl}CreateUserLoginHistory`;
        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.post(url, model, { headers: httpHeaders, observe: 'response' });
    }

    private loadTimeZones() {
        const url = `${this.baseUrl}GetListOfTimeZone`;
        return this.http.get(url, { observe: 'response' })
        .pipe(map(response => {
            return response.body as TimeZone[];
        })).subscribe((timezones: TimeZone[]) => {
            this.timeZoneDataSource$.next(timezones);
        });
    }
}