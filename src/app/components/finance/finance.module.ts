import { NgModule } from '@angular/core';
import { FinanceComponent } from './finance.component';
import { SharedModule } from '../../shared/shared.module';
import { FinanceRoutingModule } from './finance-routing.module';
import { ExpenseHistoryComponent } from '../expense-history/expense-history.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { BankAccountListComponent } from '../bank-account-list/bank-account-list.component';
import { CdkDetailRowDirective } from '../../directives/detail-row.directive';
import { ExpenseTotalPricePipe } from 'src/app/pipes/expense-total-price.pipe';
import { AccountsTotalPricePipe } from 'src/app/pipes/accounts-total-price.pipe';

@NgModule({
    declarations: [
        FinanceComponent,
        CategoryListComponent,
        BankAccountListComponent,
        ExpenseHistoryComponent,
        CdkDetailRowDirective,
        ExpenseTotalPricePipe,
        AccountsTotalPricePipe
    ],
    entryComponents: [BankAccountListComponent],
    bootstrap: [BankAccountListComponent],
    imports: [
        SharedModule,
        FinanceRoutingModule
    ]
})

export class FinanceModule {

}