import { BudgetDetail } from './BudgetDetail';

export interface Budget {
  id?: number;
  userId?: number;
  name: string;
  period?: string;
  baseAmount: number;
  totalPlanned: number;
  totalActual: number;
  budgetDetails?: BudgetDetail[];
}
