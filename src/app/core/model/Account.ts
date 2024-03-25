import { DetailCreditAccount } from './DetailCreditAccount';

export interface Account {
  accountId?: number;
  userId?: number;
  active?: boolean;
  balance: number;
  accountType: string;
  name: string;
  detailCreditAccount?: DetailCreditAccount;
}
