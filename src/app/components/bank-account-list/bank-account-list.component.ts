import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { YesNoDialogComponent } from '../../shared/yes.no.dialog.component';
import { UiService } from '../../services/ui.service';
import { BankAccountService } from 'src/app/services/bank-account.service';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers/app.reducer';
import * as UI from 'src/app/actions/ui.actions';
import { BankAccount } from 'src/app/models/bank-account.model';
import { BankAccountAddComponent } from '../bank-account-add/bank-account-add.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Account } from 'src/app/models/account.model';
import { AccountAddEditComponent } from '../account-add-edit/account-add-edit.component';
import { AccountService } from 'src/app/services/account.service';
import { CdkDetailRowDirective } from 'src/app/directives/detail-row.directive';
import { AccountActionsComponent } from '../account-actions/account-actions.component';
import { TransactionService } from 'src/app/services/transaction.service';
import { Transaction } from 'src/app/models/transaction.model';
import { AccountTransactionsComponent } from '../account-transactions/account-transactions.component';
import { User } from 'src/app/models/user.model';
import { Currency } from 'src/app/models/currency.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BankAccountListComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['CreatedDate', 'Name', 'Branch', 'Status', 'Balance', 'Actions'];
  dataSource = new MatTableDataSource<BankAccount>();
  private allSubscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;
  userTimeZone = '';

  isExpansionDetailRow = (index, row) => row.hasOwnProperty('accounts');
  @Input() singleChildRowDetail: boolean;

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChildren(CdkDetailRowDirective) detailRows: QueryList<CdkDetailRowDirective>;
  
  editBankInfo: BankAccount;
  oldBankInfo: { id?: number; userId?: string; branch: string;
                 isActive: boolean, createdDate?: Date; };
  rowInEditMode: boolean;
  userBaseCurrency: string;
  
  constructor(private dialog: MatDialog, private uiService: UiService,
              private userService: UserService,
              private bankAccountService: BankAccountService,
              private accountService: AccountService,
              private transactionService: TransactionService,
              private store: Store<{ui: fromRoot.State}>) {
              }

  ngOnInit() {
    this.allSubscriptions.push(this.userService.getUserSettings.subscribe((user: User) => {
      this.userTimeZone = user.stateTimeZone.utc;
      this.userBaseCurrency = user.currency.code;
    }));

    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.allSubscriptions.push(this.isLoading$.subscribe(loading => {
      if (loading) {
        setTimeout(() => {
          this.refreshBankInfoDataSource();
        }, 500);
      } else {
        this.refreshBankInfoDataSource();
      }
    }));
  }

  expand(element) {
    const detail = this.detailRows.find(x => x.row === element);
    detail.toggle();

    const allOtherOpenedDetails = this.detailRows.filter(x => x.row !== element && x.expended);
    allOtherOpenedDetails.forEach((i) => { i.toggle(); });
  }
  
  openDialog() {
      const dialogRef = this.dialog.open(BankAccountAddComponent);
      this.allSubscriptions.push(dialogRef.afterClosed().subscribe(result => {
        if (result && result.data) {
          this.createBankWithAccount(result.data as BankAccount);
        }
      }));
  }

  private createBankWithAccount(bankInfo: BankAccount) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.bankAccountService.createBankWithAccount(bankInfo).subscribe(response => {
      if (response.ok) {
        const bankInfoCreated = response.body as BankAccount;
        this.pushBankToDataSource(bankInfoCreated);
        this.uiService.showSnackBar('Bank Info was sucessfully created.', 3000);
      } else {
        this.uiService.showSnackBar('There was an error while creating a Bank Info, please, try again later.', 3000);
      }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while creating bank account. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }
  
  private deleteBankInfo(bankInfo: BankAccount) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.bankAccountService.deleteBankInfo(bankInfo.id).subscribe(response => {
      this.removeBankFromDataSource(bankInfo);
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while deleting bank account. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private deleteAccount(account: Account) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.accountService.deleteAccount(account.id).subscribe(response => {
      this.removeBankAccountFromDataSource(account.bankId, account.id);
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while deleting account. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }
  
  private updateAccount(accountToEdited: Account) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.accountService.updateAccount(accountToEdited).subscribe(response => {
      if (response.ok) {
        this.updateAccountDataSource(accountToEdited);
      }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while updating account. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  private openedRow: CdkDetailRowDirective;
  onToggleChange(cdkDetailRow: CdkDetailRowDirective, row: BankAccount): void {
    if (this.singleChildRowDetail && this.openedRow && this.openedRow.expended) {
      this.openedRow.toggle();
    }

    row.close = !row.close;
    this.openedRow = cdkDetailRow.expended ? cdkDetailRow : undefined;
  }

  onAccountAction(account: Account) {
      const dialogRef = this.dialog.open(AccountActionsComponent,
      {
        data: { account }
      });

      this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
        if (result && result.data) {
          this.transactionService.performAccountTransaction(result.data as Transaction).subscribe((response) => {
            if (response.ok) {
              const transactionCreated = response.body as Transaction;
              this.pushTransactionIntoDataSource(transactionCreated);
            }
          });
        }
      }));
  }

  onShowTransactions(account: Account) {
    const dialogRef = this.dialog.open(AccountTransactionsComponent,
    {
      maxWidth: '95%',
      data: { account }
    });
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onIsActiveChange(bankInfo: BankAccount) {
    if (bankInfo.isActive && bankInfo.accounts.some(a => a.isActive)) {
      const dialogRef = this.dialog.open(YesNoDialogComponent,
      {
        data:
          {
            message: 'Are you sure you want to inactivate this bank? If you proceed, all its account will be also set to inactive.',
            title: 'Are you sure?'
          }
      });

      this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
        if (!result) {
          bankInfo.isActive = true;
        } else {
          bankInfo.accounts.forEach(a => a.isActive = false);
        }
      }));
    }
  }

  onDelete(bankInfo: BankAccount) {
    const dialogRef = this.dialog.open(YesNoDialogComponent,
    {
      data:
        {
          message: 'Are you sure you want to delete this bank?',
          title: 'Are you sure?'
        }
    });
    this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteBankInfo(bankInfo);
      }
    }));
  }

  private removeBankFromDataSource(bankInfo: BankAccount) {
    const index = this.dataSource.data.findIndex(x => x.id === bankInfo.id);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
    }
    this.bankAccountService.setBankAccountInfos = this.dataSource.data;
  }

  private pushTransactionIntoDataSource(transactionCreated: Transaction) {
    var bank = this.dataSource.data.find(b => b.accounts.some(a => a.id === transactionCreated.account.id));
    var account = bank.accounts.find(a => a.id === transactionCreated.account.id);
    account.currentBalance = transactionCreated.balanceAfterTransaction;
    account.transactions.push(transactionCreated);

    this.bankAccountService.setBankAccountInfos = this.dataSource.data;
  }

  private pushAccountToDataSource(accountAdded: Account) {
    const index = this.dataSource.data.findIndex(x => x.id === accountAdded.bankId);

    if (index > -1) {
      this.dataSource.data[index].accounts.push(accountAdded);
    }
    this.bankAccountService.setBankAccountInfos = this.dataSource.data;
  }

  private updateAccountDataSource(accountToEdited: Account) {
    const index = this.dataSource.data.findIndex(x => x.id === accountToEdited.bankId);
    if (index > -1) {
      this.dataSource.data[index].accounts.forEach(account => {
        if (account.id === accountToEdited.id) {
          account.name = accountToEdited.name;
          account.number = accountToEdited.number;
          account.isActive = accountToEdited.isActive;
        }
      });
    }
    this.bankAccountService.setBankAccountInfos = this.dataSource.data;
  }

  private removeBankAccountFromDataSource(bankId: number, accountId: number) {
    const bankInfoFromDataSource = this.dataSource.data;
    const index = bankInfoFromDataSource.findIndex(b => b.id === bankId);
    if (index > -1) {
      const accountIndex = bankInfoFromDataSource[index].accounts.findIndex(a => a.id === accountId);
      if (accountIndex > -1) {
        bankInfoFromDataSource[index].accounts.splice(accountIndex, 1);
      }
    }
    this.bankAccountService.setBankAccountInfos = bankInfoFromDataSource;
  }

  private pushBankToDataSource(bankInfoCreated: BankAccount) {
    this.dataSource.data.push(bankInfoCreated);
    this.bankAccountService.setBankAccountInfos = this.dataSource.data;
  }

  private refreshBankInfoDataSource() {
    this.allSubscriptions.push(this.bankAccountService.getBankAccountInfos.subscribe((bankInfos: BankAccount[]) => {
      this.dataSource = new MatTableDataSource(bankInfos);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }));
 }

  onAddAccout(bankInfo: BankAccount) {
    const dialogRef = this.dialog.open(AccountAddEditComponent,
    {
      maxWidth: '95%',
      data: { actionMode: 'Add', account: { bankId: bankInfo.id, name: '',
              isActive: true, currency: { code: '' } as Currency } as Account }
    });
    this.allSubscriptions.push(dialogRef.afterClosed().subscribe((accountToAdded: Account) => {
      if (accountToAdded) {
        this.createAccount(accountToAdded);
      }
    }));
  }

  private createAccount(accountToAdded: Account) {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.accountService.createAccount(accountToAdded).subscribe(response => {
      if (response.ok) {
        this.pushAccountToDataSource(response.body as Account);
      }
    }, (err) => {
      this.uiService.showSnackBar(err.error, 3000);
    });

    subscription.add(() => {
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  onEditAccount(account: Account, isBankActive: boolean) {
    const dialogRef = this.dialog.open(AccountAddEditComponent,
    {
      maxWidth: '95%',
      data: { actionMode: 'Edit', account, isBankActive }
    });

    this.allSubscriptions.push(dialogRef.afterClosed().subscribe((accountToEdited: Account) => {
      if (accountToEdited) {
        this.updateAccount(accountToEdited);
      }
    }));
  }

  onDeleteAccount(account: Account) {
    const dialogRef = this.dialog.open(YesNoDialogComponent,
    {
      data:
        {
          message: `Are you sure you want to delete this ${account.name} account?`,
          title: 'Are you sure?'
        }
    });

    this.allSubscriptions.push(dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteAccount(account);
      }
    }));
  }

  onUpdate() {
    this.store.dispatch(new UI.StartLoading());
    const subscription = this.bankAccountService.updateBankInfo(this.editBankInfo).subscribe(response => {
      if (response.ok) {
        this.bankAccountService.setBankAccountInfos = this.dataSource.data;
        this.uiService.showSnackBar('Bank info successfully updated.', 3000);
        } else {
          this.uiService.showSnackBar('There was an error while trying to update Bank info. Please, try again later!', 3000);
        }
    }, (err) => {
      this.uiService.showSnackBar(`An error occured while updating bank account. Error code: ${err.status} - ${err.statusText}`, 3000);
    });

    subscription.add(() => {
      this.onCancelEdit();
      this.store.dispatch(new UI.StopLoading());
    });

    this.allSubscriptions.push(subscription);
  }

  onEdit(bankInfo: BankAccount) {
    this.editBankInfo = bankInfo && bankInfo.id ? bankInfo : {} as BankAccount;
    this.oldBankInfo = {...this.editBankInfo};
    this.rowInEditMode = true;
  }

  onCancelEdit(){
    this.rowInEditMode = false;
    this.editBankInfo = {} as BankAccount;
    this.oldBankInfo = {} as BankAccount;
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