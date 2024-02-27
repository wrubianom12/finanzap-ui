export interface Transaction {
  transactionId?: number;
  accountId: number;
  value: number;
  category: string;
  type: string;
  date: string;
  description: string;
}
