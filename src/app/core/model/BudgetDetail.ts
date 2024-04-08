export interface BudgetDetail {
  id?: number;
  categoryType: string;
  classificationCode: string;
  classificationName: string;
  categoryTypeName: string;
  amountPlanned: number;
  amountActual?: number;
}
