export interface BudgetDetail {
  id?: number;
  categoryType: string;
  categoryTypeName: string;
  amountPlanned: number;
  amountActual?: number;
}
