import { Component, OnInit, Inject, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatSort } from '@angular/material';
import { Transaction } from 'src/app/models/transaction.model';
import { Account } from 'src/app/models/account.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account-transactions',
  templateUrl: './account-transactions.component.html',
  styleUrls: ['./account-transactions.component.scss']
})
export class AccountTransactionsComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription: Subscription;
  account: Account;
  userTimeZone = '';
  displayedColumns = ['CreatedDate', 'Description', 'Amount', 'Balance'];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource = new MatTableDataSource<Transaction>();

  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any, private userService: UserService) {    
    this.account = { ...passedData.account };
    this.dataSource = new MatTableDataSource(this.account.transactions);
    setTimeout(() => { this.dataSource.sort = this.sort; }, 150);
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

  ngOnInit() {
    this.subscription = this.userService.getUserSettings.subscribe((user: User) => {
      this.userTimeZone = user.stateTimeZone.utc;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
