import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { BankAccount } from 'src/app/models/bank-account.model';
import { Account } from 'src/app/models/account.model';
import { NgForm } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { Currency } from 'src/app/models/currency.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-bank-account-add',
  templateUrl: './bank-account-add.component.html',
  styleUrls: ['./bank-account-add.component.scss']
})
export class BankAccountAddComponent implements OnInit {
  currencies: Currency[];
  account: Account;
  bankAccount: BankAccount;

  constructor(private dialogRef: MatDialogRef<BankAccountAddComponent>,
              private commonService: CommonService) {
  }
  ngOnInit(): void {
    let userSettings = JSON.parse(localStorage.getItem('user')) as User;
    this.account = { name: 'Checking Account', description: '',
      currency: userSettings.currency, number: '', isActive: true, transactions: [] } as Account;
    this.bankAccount = { name: '', branch: '', accounts: [] } as BankAccount;

    this.commonService.getAllCurrencies.subscribe(x => {
      this.currencies = x;
    });
  }
  
  onSave() {
    this.account.description = `Checking Account linked to ${this.bankAccount.name}`;      
    const bankInfo = { name: this.bankAccount.name, branch: this.bankAccount.branch,
        isActive: true, accounts: [this.account] } as BankAccount;
    this.dialogRef.close({ data: bankInfo });
  }

}
