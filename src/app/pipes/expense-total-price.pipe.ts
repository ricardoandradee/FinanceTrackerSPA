import { Pipe, PipeTransform } from '@angular/core';
import { Expense } from '../models/expense.model';
import { CurrencyConverterMapper } from '../models/currency.converter.mapper.model';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'expenseTotalPrice'
})
export class ExpenseTotalPricePipe implements PipeTransform {
    constructor(public currencyService: CurrencyService) { }

    transform(items: Expense[], userBaseCurrency: string): number {
        const allCurrenciesToConvert = items.map(x => x.currency.code);
        if (this.currencyService.checkIfCurrenciesAreLoaded(allCurrenciesToConvert)) {
        const currencyMapperList = items.map((expense: Expense) => {
            return { currencyFrom: expense.currency.code, currencyTo: userBaseCurrency,
                     price: expense.price } as CurrencyConverterMapper;
        });
        return this.currencyService.convertCurrencyList(currencyMapperList);
        }
    }
}