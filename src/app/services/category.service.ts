
import { Category } from '../models/category.model';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { DatePipe } from '@angular/common';
import { ExpenseService } from './expense.service';

@Injectable()
export class CategoryService {
    private baseUrl = environment.apiUrl + 'user/';
    private dataSource$: BehaviorSubject<Category[]> = new BehaviorSubject([]);

    constructor(private http: HttpClient,
                private expenseService: ExpenseService,
                private datePipe: DatePipe) {

                this.expenseService.getExpenses.subscribe((p) => {
                    const allcategories = this.dataSource$.value;
                    allcategories.forEach(c => {
                      c.canBeDeleted = !p.some(b => b.category.id === c.id);
                    });
                    this.setCategories = allcategories;
                });
    }

    get getCategories(): Observable<Category[]> {
        return this.dataSource$.asObservable();
    }

    set setCategories(categories: Category[]) {
        this.dataSource$.next(categories);
    }

    getCategoriesByUserId(): Observable<Category[]> {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}${user.id}/category/GetCategoriesByUserId`;

        return this.http.get<Category[]>(url, { observe: 'response' })
        .pipe(
        map(response => {
            const categories: Category[] = response.body;
            return categories;
        }));
    }
    
    deleteCategory(categoryId: number) {
        const user: User = JSON.parse(localStorage.getItem('user'));
        const url = `${this.baseUrl}${user.id}/category/DeleteCategory/${categoryId}`;
        return this.http.delete(url, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }

    createCategory(category: Category) {
        const user: User = JSON.parse(localStorage.getItem('user')); 
        const newCategory = {
            userId: user.id,
            name: category.name,
            createdDate: this.datePipe.transform(category.createdDate, "yyyy-MM-ddTHH:mm:ss")
        };

        const url = `${this.baseUrl}${user.id}/category/CreateCategory`;
        
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.post(url, newCategory, { headers: httpHeaders, observe: 'response' });
    }

    updateCategory(category: Category) {
        const user: User = JSON.parse(localStorage.getItem('user')); 
        const newCategory = {
            name: category.name
        };

        const url = `${this.baseUrl}${user.id}/category/UpdateCategory/${category.id}`;
        
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json'
        });

        return this.http.put(url, newCategory, { headers: httpHeaders, observe: 'response' });
    }
}