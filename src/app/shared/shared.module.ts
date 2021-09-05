import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BankAccountsBalance } from 'src/app/pipes/bank-accounts-balance.pipe';

@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        MaterialModule,
        FlexLayoutModule
    ],
    declarations: [
        BankAccountsBalance
    ],
    exports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        BankAccountsBalance
    ]
})
export class SharedModule { }