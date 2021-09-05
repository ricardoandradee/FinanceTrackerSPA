import { Account } from './account.model';
export interface Transaction {
    id?: number;
    description: string;
    amount: number;
    action: 'Deposit' | 'Withdraw' | 'Debit';
    balanceAfterTransaction: number;
    accountId: number;
    account: Account;
    createdDate?: Date;
}