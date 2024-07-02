export interface Transaction {
  transactionId?: number;
  accountId: number;
  value: number;
  category: number;
  type: string;
  date: string;
  description: string;
}
