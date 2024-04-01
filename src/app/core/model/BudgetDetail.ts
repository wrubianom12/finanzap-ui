export interface BudgetDetail {
  id?: number;
  categoryType: string;
  classificationCode: string;
  categoryTypeName: string;
  amountPlanned: number;
  amountActual?: number;
}
