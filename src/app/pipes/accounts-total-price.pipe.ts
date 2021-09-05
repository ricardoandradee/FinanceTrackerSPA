import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyConverterMapper } from '../models/currency.converter.mapper.model';
import { CurrencyService } from '../services/currency.service';
import { BankAccount } from '../models/bank-account.model';
import { Account } from '../models/account.model';

@Pipe({
  name: 'accountsTotalPrice'
})
export class AccountsTotalPricePipe implements PipeTransform {
    constructor(public currencyService: CurrencyService) { }

    transform(items: BankAccount[], userBaseCurrency: string): number {
        const accounts = ([] as Account[]).concat(...items.map(x => ( x.accounts )));
        const allCurrenciesToConvert = accounts.map(x => x.currency.code);

        if (this.currencyService.checkIfCurrenciesAreLoaded(allCurrenciesToConvert)) {
        const currencyMapperList = accounts.map((account: Account) => {
            return { currencyFrom: account.currency.code, currencyTo: userBaseCurrency,
                     price: account.currentBalance } as CurrencyConverterMapper;
        });
        return this.currencyService.convertCurrencyList(currencyMapperList);
        }
    }
}