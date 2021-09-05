import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense } from '../models/expense.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';

@Injectable()
export class ExpenseService {
    private baseUrl = environment.apiUrl + 'user/';
    private dataSource$: BehaviorSubject<Expense[]> = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
    }

    get getExpenses(): Observable<Expense[]> {
        return this.dataSource$.asObservable();
    }

    set setExpenses(expenses: Expense[]) {
        this.dataSource$.next(expenses);
    }

    getExpensesByUserId(): Observable<Expense[]> {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}${user.id}/Expense/GetExpensesByUserId`;
        return this.http.get<Expense[]>(url, { observe: 'response' })
        .pipe(
        map(response => {
            const expenses: Expense[] = response.body;
            return expenses;
        }));
    }

    createExpense(expense: Expense) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const newExpense = {
            establishment: expense.establishment,
            categoryId: expense.category.id,
            currencyId: expense.currency.id,
            price: expense.price,
            isPaid: expense.isPaid,
            accountId: expense.accountId,
            transactionAmount: expense.transactionAmount
        };
        const url = `${this.baseUrl}${user.id}/Expense/CreateExpense`;
        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });
        return this.http.post(url, newExpense, { headers: httpHeaders, observe: 'response' });
    }

    updateExpense(expense: Expense) {
        const user: User = JSON.parse(localStorage.getItem('user')); 
        const newExpense = {
            establishment: expense.establishment,
            categoryId: expense.category.id,
            currencyId: expense.currency.id,
            price: expense.price,
            isPaid: expense.isPaid,
            accountId: expense.accountId,
            transactionAmount: expense.transactionAmount
        };
        
        const url = `${this.baseUrl}${user.id}/Expense/UpdateExpense/${expense.id}`;
        const httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.put(url, newExpense, { headers: httpHeaders, observe: 'response' });
    }
    
    deleteExpense(expenseId: number) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}${user.id}/Expense/DeleteExpense/${expenseId}`;
        return this.http.delete(url, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }
}