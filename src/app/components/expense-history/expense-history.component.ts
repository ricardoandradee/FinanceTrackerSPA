import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Expense } from '../../models/expense.model';
import { YesNoDialogComponent } from '../../shared/yes.no.dialog.component';
import { ExpenseAddComponent } from '../expense-add/expense-add.component';
import { Category } from '../../models/category.model';
import { ExpenseService } from 'src/app/services/expense.service';
import { UiService } from 'src/app/services/ui.service';
import { CategoryService } from 'src/app/services/category.service';

import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers/app.reducer';
import * as UI from 'src/app/actions/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { KeyValuePair, getUniquePairs } from 'src/app/models/key-value-pair.model';
import { User } from 'src/app/models/user.model';
import { Currency } from 'src/app/models/currency.model';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';
import { BankAccountService } from 'src/app/services/bank-account.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-expense-history',
  templateUrl: './expense-history.component.html',
  styleUrls: ['./expense-history.component.scss']
})

export class ExpenseHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['CreatedDate', 'Category', 'Establishment', 'Price', 'Status', 'Actions'];
  dataSource = new MatTableDataSource<Expense>();
  private allSubscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;
  currencies: Currency[];
  allCategories: Category[];

  datesKeyValue: KeyValuePair<string, string>[];
  categoriesKeyValue: KeyValuePair<number, string>[];
  expenseDate = 'All';
  category = 'All';
  userBaseCurrency: string;
  userTimeZone = '';

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  constructor(private uiService: UiService, private expenseService: ExpenseService,
              private userService: UserService, private dialog: MatDialog,
              private categoryService: CategoryService,
              private commonService: CommonService,
              private accountService: AccountService,
              private bankAccountService: BankAccountService,
              private store: Store<{ui: fromRoot.State}>) {
              }

  ngOnInit() {

    this.commonService.getAllCurrencies.subscribe(x => {
      this.currencies = x;
    });
    
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.allSubscriptions.push(this.categoryService.getCategories.subscribe((categoryList: Category[]) => {
      this.allCategories = categoryList;
    }));

    this.allSubscriptions.push(this.userService.getUserSettings.subscribe((user: User) => {
      this.userBaseCurrency = user.currency.code;
      this.userTimeZone = user.stateTimeZone.utc;
    }));
    
    this.allSubscriptions.push(this.isLoading$.subscribe(loading => {
      if (loading) {
        setTimeout(() => {
          this.refreshExpenseDataSource();
        }, 500);
      } else {
        this.refreshExpenseDataSource();
      }
    }));
  }

  bindDataSource(expenses: Expense[]) {
    this.dataSource = new MatTableDataSource(expenses);    
    this.dataSource.filterPredicate = (pr, filter) => {
      return this.dateFilterMatches(pr) && this.categoryFilterMatches(pr);
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  populateDropDownLists(expenses: Expense[]) {
    this.categoriesKeyValue  = getUniquePairs(expenses.map((expense: Expense) =>
    {
        return { key: expense.category.id, value: expense.category.name } as KeyValuePair<number, string>;
    }));
    
    this.datesKeyValue = getUniquePairs(expenses.map((expense: Expense) =>
    {
        return { key: expense.createdDateString, value: expense.createdDateString } as KeyValuePair<string, string>;
    }));
  }

  onOpenAddExpenseDialog(expense: Expense = null, isEditMode: boolean = false) {    
    if (!isEditMode) {
      let userSettings = JSON.parse(localStorage.getItem('user')) as User;
      expense = {
        establishment: "",
        isPaid: false,
        category: { id: 0 } as Category,
        currency: userSettings.currency
      } as Expense;
    }

    const dialogRef = this.dialog.open(ExpenseAddComponent,
      {
        data: { expense, isEditMode }
      });
    this.allSubscriptions.push(dialogRef.afterClosed().subscribe(result => {
      if (result && result.data) {
        if (isEditMode) {
          this.updateExpense(result.data as Expense);
        } else {
          this.createExpense(result.data as Expense);
        }
      }
    }));
  }

  onDelete(expense: Expense) {
    const dialogRef = this.dialog.open(YesNoDialogComponent,
    { data:
      {
        message: 'Are you sure you want to delete this item from your history?',
        title: 'Are you sure?'
      }
    });

    this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteExpense(expense);
      }
    }));
  }
  
  private createExpense(expenseToBeCreated: Expense) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.expenseService.createExpense(expenseToBeCreated).subscribe(response => {
      if (response.ok) {
        const expenseCreated = response.body as Expense;
        if (expenseCreated.accountId) {
          this.accountService.getAccountById(expenseCreated.accountId).subscribe(accout => {
            this.bankAccountService.replaceAccountDetails = accout;
          });
        }
        
        this.pushExpenseToDataSource(expenseCreated);
        this.uiService.showSnackBar('Expense was sucessfully created.', 3000);
      } else {
        this.uiService.showSnackBar('An error occured while adding expense details, please, try again later.', 3000);
      }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while adding expense details. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }
  
  private updateExpense(expenseToBeEdited: Expense) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.expenseService.updateExpense(expenseToBeEdited).subscribe(response => {
      if (response.ok) {
        const expenseUpdated = response.body as Expense;
        if (expenseUpdated.accountId) {
          this.accountService.getAccountById(expenseUpdated.accountId).subscribe(accout => {
            this.bankAccountService.replaceAccountDetails = accout;
          });
        }
        
        const targetIdx = this.dataSource.data.map(i => i.id).indexOf(expenseToBeEdited.id);
        this.dataSource[targetIdx] = expenseUpdated;
        this.expenseService.setExpenses = this.dataSource.data;

        this.uiService.showSnackBar('Expense successfully updated.', 3000);
        } else {
          this.uiService.showSnackBar('There was an error while trying to update your Expense. Please, try again later!', 3000);
        }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while updating expense info. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private deleteExpense(expense: Expense) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.expenseService.deleteExpense(expense.id).subscribe(response => {
      if (expense.accountId) {
        this.accountService.getAccountById(expense.accountId).subscribe(accout => {
          this.bankAccountService.replaceAccountDetails = accout;
        });
      }      
      this.removeExpenseFromDataSource(expense.id);
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while deleting expense info. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private refreshExpenseDataSource() {
    this.allSubscriptions.push(this.expenseService.getExpenses.subscribe((expenses: Expense[]) => {
      this.bindDataSource(expenses);
      this.populateDropDownLists(expenses);
    }));
 }

  private pushExpenseToDataSource(expenseCreated: Expense) {
    const expensesFromDataSource = this.dataSource.data;
    expensesFromDataSource.push(expenseCreated);
    this.expenseService.setExpenses = expensesFromDataSource;
  }

  private removeExpenseFromDataSource(expenseId: number) {
    const expensesFromDataSource = this.dataSource.data;
    const expenseIndex = expensesFromDataSource.findIndex(x => x.id === expenseId);
    if (expenseIndex > -1) {
      expensesFromDataSource.splice(expenseIndex, 1);
    }
    this.expenseService.setExpenses = expensesFromDataSource;
  }
  
  applyFilterByDate() {
    this.dataSource.filter = this.getDateFilter();
  }
  
  applyFilterByCategory() {
    this.dataSource.filter = '[FilterByCategory]' + this.category;
  }

  dateFilterMatches(expense: Expense): boolean {
    const filter = this.getDateFilter();
    const value = '[FilterByDate]' + expense.createdDateString;
    return filter.indexOf('[FilterByDate]') === -1 || (filter === '[FilterByDate]All' || value.indexOf(filter) >= 0);
  }

  categoryFilterMatches(expense: Expense): boolean {
    const filter = '[FilterByCategory]' + this.category;
    const value = '[FilterByCategory]' + expense.category.id;
    return filter.indexOf('[FilterByCategory]') === -1 || (filter === '[FilterByCategory]All' || value.indexOf(filter) >= 0);
  }

  getDateFilter(): string {
    const dateToBeSearched = this.expenseDate === 'All' ? 'All' : this.expenseDate;
    return '[FilterByDate]' + dateToBeSearched;
  }

  onEdit(expense: Expense) {
    var expenseToBeEdited = expense && expense.id ? expense : {} as Expense;
    this.onOpenAddExpenseDialog(expenseToBeEdited, true);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property.toLowerCase()) {
        case 'createddate': {
          let newDate = new Date(item.createdDate);
          return newDate;
        }
        default: {
          return item[property];
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.allSubscriptions.forEach(s => { s.unsubscribe()});
  }
}
