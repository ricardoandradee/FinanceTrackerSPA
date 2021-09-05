import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BankAccount } from '../models/bank-account.model';
import { User } from '../models/user.model';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Account } from '../models/account.model';

@Injectable()
export class BankAccountService implements OnDestroy {
    private baseUrl = environment.apiUrl;
    private subscription: Subscription;
    private dataSource$: BehaviorSubject<BankAccount[]> = new BehaviorSubject([]);

    constructor(private http: HttpClient, private authService: AuthService) {
        this.authService.getIsAuthenticated.subscribe(isAuth => {
            if (isAuth) {
                this.loadBankAccounts();
            }
        })       
    }

        get getBankAccountInfos(): Observable<BankAccount[]> {
            return this.dataSource$.asObservable();
        }
    
        set setBankAccountInfos(bankInfos: BankAccount[]) {
            this.dataSource$.next(bankInfos);
        }

        set replaceAccountDetails(account: Account) {
            this.subscription = this.dataSource$.pipe(take(1)).subscribe(banks => {
                var bank  = banks.find(b => b.accounts.some(a => a.id == account.id));
                const accountIndex = bank.accounts.findIndex(x => x.id == account.id);
                if (accountIndex > -1) {
                    bank.accounts.splice(accountIndex, 1);
                    bank.accounts.splice(accountIndex, 0, account);
                }
                this.setBankAccountInfos = banks;
              });
        }
        
    private loadBankAccounts() {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}user/${user.id}/bank/GetBanksByUserId`;
        
        return this.http.get<BankAccount[]>(url, { observe: 'response' })
        .pipe(map(response => {
            return (response.body as BankAccount[]).sort((a, b) => (a.name > b.name) ? 1 : -1);
        })).subscribe((bankAccounts: BankAccount[]) => {
            this.dataSource$.next(bankAccounts);
        });
    }
        
    deleteBankInfo(bankId: number) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}user/${user.id}/bank/${bankId}/DeleteBankInfo`;
        return this.http.delete(url, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }
    
    createBankWithAccount(bankAccount: BankAccount) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const newBankInfo = {
            userId: user.id,
            name: bankAccount.name,
            branch: bankAccount.branch,
            isActive: bankAccount.isActive,
            accounts: bankAccount.accounts
        };

        const url = `${this.baseUrl}user/${user.id}/bank/CreateBankWithAccount`;
        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.post(url, newBankInfo, { headers: httpHeaders, observe: 'response' });
    }

    updateBankInfo(bankAccount: BankAccount) {
        const user: User = JSON.parse(localStorage.getItem('user')); 
        const url = `${this.baseUrl}user/${user.id}/bank/${bankAccount.id}/updateBankInfo`;
        const newBankInfo = {
            name: bankAccount.name,
            branch: bankAccount.branch,
            isActive: bankAccount.isActive,
            accountsForCreation: bankAccount.accounts
        };
        
        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.put(url, newBankInfo, { headers: httpHeaders, observe: 'response' });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
    }
}