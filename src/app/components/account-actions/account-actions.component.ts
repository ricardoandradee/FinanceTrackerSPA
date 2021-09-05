import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Transaction } from 'src/app/models/transaction.model';

@Component({
  selector: 'app-account-actions',
  templateUrl: './account-actions.component.html',
  styleUrls: ['./account-actions.component.scss']
})
export class AccountActionsComponent implements OnInit {
  transaction = {  action: 'Deposit', description: '' } as Transaction;
  accountActions: string[] = ['Deposit', 'Withdraw'];

  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
              private dialogRef: MatDialogRef<AccountActionsComponent>) {
    this.transaction.account = { ...passedData.account };
  }

  onSave() {
    this.dialogRef.close({ data: this.transaction });
  }

  ngOnInit() {
  }

}
