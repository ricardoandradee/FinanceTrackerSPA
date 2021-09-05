import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Account } from 'src/app/models/account.model';
import { CommonService } from 'src/app/services/common.service';
import { Currency } from 'src/app/models/currency.model';

@Component({
  selector: 'app-account-add-edit',
  templateUrl: './account-add-edit.component.html',
  styleUrls: ['./account-add-edit.component.scss']
})
export class AccountAddEditComponent implements OnInit {
  currencies: Currency[];
  account: Account;
  actionMode = 'Add';
  isBankActive = false;

  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any,
              private dialogRef: MatDialogRef<AccountAddEditComponent>,
              private commonService: CommonService) {
                this.actionMode = passedData.actionMode;
                this.account = { ...passedData.account };
                this.isBankActive = this.actionMode === 'Edit' ? passedData.isBankActive : false;
              }
  
  ngOnInit(): void {
    this.commonService.getAllCurrencies.subscribe(x => {
      this.currencies = x;
    });
  }
  
  onSave() {
    console.log(this.account);
    this.dialogRef.close(this.account);
  }

}
