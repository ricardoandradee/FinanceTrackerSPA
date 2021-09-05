import { Currency } from './currency.model';
import { TimeZone } from './timezone.model';

export interface User {
    id: number;
    fullName: string;
    email: string;
    currency: Currency;
    stateTimeZone: TimeZone;
    createdDate: Date;
    wallet: number;
    stateTimeZoneId: string;
    password: string;
}