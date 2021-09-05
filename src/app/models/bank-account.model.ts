import { Account } from 'src/app/models/account.model';
export class BankAccount {
    id?: number;
    userId?: string;
    name: string;
    branch: string;
    isActive: boolean;
    createdDate?: Date;
    accounts: Account[];
    close = true;
}
