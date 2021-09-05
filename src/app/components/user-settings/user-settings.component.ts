import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { TimeZone } from 'src/app/models/timezone.model';
import { Currency } from 'src/app/models/currency.model';
import { CommonService } from 'src/app/services/common.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  timeZones: TimeZone[];
  currencies: Currency[];
  userSettings: User;

  constructor(private dialogRef: MatDialogRef<UserSettingsComponent>,
              private commonService: CommonService) {
    this.userSettings = JSON.parse(localStorage.getItem('user')) as User;
  }

  ngOnInit() {
    this.commonService.getAllCurrencies.subscribe(c => {
      this.currencies = c;
    });

    this.commonService.getAllTimezones.subscribe(tz => {
      this.timeZones = tz;
    });
  }

  onSave() {
    const user = {
      id: this.userSettings.id,
      currency: this.currencies.find(x => x.id === this.userSettings.currency.id),
      stateTimeZone: this.timeZones.find(x => x.id === this.userSettings.stateTimeZone.id)
    };
    this.dialogRef.close({ data: user });
  }
}
