export interface BudgetDetail {
  id?: number;
  categoryTypeId: number;
  classificationCode: string;
  classificationName: string;
  categoryTypeName: string;
  amountPlanned: number;
  amountActual?: number;
}
