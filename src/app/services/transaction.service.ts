import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { DatePipe } from '@angular/common';
import { Transaction } from '../models/transaction.model';

@Injectable()
export class TransactionService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient,
                private datePipe: DatePipe) { }

    performAccountTransaction(transaction: Transaction) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const createdDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
        const newTransaction = {
            description: transaction.description,
            amount: transaction.amount,
            action: transaction.action,
            accountId: transaction.account.id,
            createdDate
        };

        const url = `${this.baseUrl}user/${user.id}/account/${transaction.account.id}/transaction/PerformAccountTransaction`;

        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.post(url, newTransaction, { headers: httpHeaders, observe: 'response' });
    }
}
