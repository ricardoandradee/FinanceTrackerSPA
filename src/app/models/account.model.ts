import { Transaction } from './transaction.model';
import { Currency } from './currency.model';
export interface Account {
    id?: number;
    bankId?: number;
    name: string;
    description: string;
    isActive: boolean;
    number: string;
    currentBalance?: number;
    currency: Currency;
    createdDate?: Date;
    transactions: Transaction[];
}