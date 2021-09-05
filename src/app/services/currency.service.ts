import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CurrencyConverterMapper } from '../models/currency.converter.mapper.model';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KeyValuePair } from '../models/key-value-pair.model';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Rates } from '../data/rates.mock.data';
import { Currency } from '../models/currency.model';

@Injectable()
export class CurrencyService implements OnDestroy {
    private subscription: Subscription;
    private baseUrl = environment.apiUrl;
    private dataSource$: BehaviorSubject<Currency> = new BehaviorSubject(null);

    constructor(private http: HttpClient) { }

    checkIfCurrenciesAreLoaded(currencies: string[]): boolean {
        if (!this.getCurrencyRates || this.getCurrencyRates.length === 0) {
            return false;
        }

        return currencies.filter(c => this.getCurrencyRates.some(r => r.key === c)).length === currencies.length;
    }

    get getUserBaseCurrency(): Observable<Currency> {
        return this.dataSource$.asObservable();
    }

    set setUserBaseCurrency(baseCurrency: Currency) {
        this.dataSource$.next(baseCurrency);
    }

    private loadDevCurrencies() {
        const rates = Object.keys(Rates.rates).map((rate: any) =>
        {
            return { key: rate, value: Rates.rates[rate] } as KeyValuePair<string, number>;
        });
        localStorage.setItem('currencyRates', JSON.stringify(rates));
    }
    
    private loadProdCurrencies() {
        const url = `${this.baseUrl}currency/GetListOfRates`;
        return this.http.get(url, { observe: 'response' })
        .pipe(map(response => {
            return response.body;
        })).subscribe((data: any) => {
            const rates = Object.keys(data.rates).map((rate: any) =>
            {
                return { key: rate, value: data.rates[rate] } as KeyValuePair<string, number>;
            });

            localStorage.setItem('currencyRates', JSON.stringify(rates));
        });
    }
    
    public fetchListOfCurrencies() {
      const currencyRates: KeyValuePair<string, number>[] = JSON.parse(localStorage.getItem('currencyRates'));

        if (!currencyRates) {
            if (environment.production) {
                this.subscription = this.loadProdCurrencies();
            } else {
                this.loadDevCurrencies();
            }
        }

    }
    
    convertCurrency(mapperList: CurrencyConverterMapper): number {
        const currencyRateFrom = this.getCurrencyRates.find((x) => x.key === mapperList.currencyFrom);
        const currencyRateTo = this.getCurrencyRates.find((x) => x.key === mapperList.currencyTo);
        return currencyRateTo && currencyRateFrom ? mapperList.price * (currencyRateTo.value * (1 / currencyRateFrom.value)) : mapperList.price;
    }

    get getCurrencyRates(): KeyValuePair<string, number>[] {
        const rates: KeyValuePair<string, number>[] = JSON.parse(localStorage.getItem('currencyRates'));
        return rates;
    }

    convertCurrencyList(mapperList: CurrencyConverterMapper[], tries = 3): number {
        return mapperList.map(m => this.convertCurrency(m)).reduce((a, b) => a + b, 0);
    }

    updateUserBaseCurrency(currencyId: number) {
        const user: User = JSON.parse(localStorage.getItem('user')); 
        const url = `${this.baseUrl}user/${user.id}/UpdateUserBaseCurrency/${currencyId}`;
        
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.put(url, { headers: httpHeaders, observe: 'response' });
    }

    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}