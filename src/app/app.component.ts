import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CategoryService } from './services/category.service';
import { Category } from './models/category.model';
import { ExpenseService } from './services/expense.service';
import { Expense } from './models/expense.model';
import { AuthService } from './services/auth.service';
import { switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './models/user.model';
import { SidenavListComponent } from './components/navigation/sidenav-list/sidenav-list.component';
import { Subscription } from 'rxjs';
import { UserService } from './services/user.service';
import { HeaderComponent } from './components/navigation/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(SidenavListComponent, { static: false }) sidNav: SidenavListComponent;
  @ViewChild(HeaderComponent, { static: false }) header: HeaderComponent;

  private jwtHelper = new JwtHelperService();
  private expenses: Expense[];
  private categories: Category[];
  private allSubscriptions: Subscription[] = [];

  title = 'SpendWise';
  openSideNav = false;
  sidenavWidth = window.innerWidth > 599 ? 4 : 3;

  constructor(private categoryService: CategoryService,
              private expenseService: ExpenseService,
              private userService: UserService,
              private authService: AuthService) {
                const token = localStorage.getItem('token');
                if (token) {
                  this.authService.setIsAuthenticated = !this.jwtHelper.isTokenExpired(token);
                }

                const user: User = JSON.parse(localStorage.getItem('user'));
                if (user) {
                  this.userService.setUserSettings = user;
                }
              }

  increase() {
    let screenSize = window.innerWidth;
    this.sidNav.screenSize = screenSize;
    this.sidNav.sidenavWidth = screenSize > 599 ? 15 : 7;
    this.sidenavWidth = screenSize > 599 ? 15 : 7;
  }

  decrease() {
    let screenSize = window.innerWidth;
    this.sidNav.screenSize = screenSize;
    this.sidNav.sidenavWidth = screenSize > 599 ? 4 : 3;
    this.sidenavWidth = screenSize > 599 ? 4 : 3;
  }
  
  ngOnInit() {
    this.allSubscriptions.push(this.authService.getIsAuthenticated.subscribe(isAuth => {
          if (isAuth) {
            const getExpenseCategoryMap = (id) => {
              return this.categoryService.getCategoriesByUserId().pipe(
                switchMap(categories => 
                  this.expenseService.getExpensesByUserId().pipe(
                    switchMap(expenses => [{ categories: categories, expenses: expenses }])
                  )
                )
              )
            };

            this.allSubscriptions.push(getExpenseCategoryMap(0).subscribe(result => {
              this.categories = result.categories;
              this.expenses = result.expenses;
            }).add(() => {
              this.updateExpenseListToContainer();
              this.updateCategoryListToContainers();
            }));
          }
      }));
  }

  updateExpenseListToContainer() {
    this.categoryService.setCategories = this.categories;
    this.expenseService.setExpenses = this.expenses;
  }

  updateCategoryListToContainers() {
    this.categoryService.setCategories = this.categories;
    this.expenseService.setExpenses = this.expenses;
  }
  
  onLogout () {
    this.header.openSideNav = false;
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(s => { s.unsubscribe()});
  }
}
