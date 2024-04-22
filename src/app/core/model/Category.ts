import { ClassificationModel } from './ClassificationModel';

export interface Category {
  categoryId?: number,
  code: string;
  name: string;
  transactionTypeEnum: string;

  selected?: boolean;
  classifications?: ClassificationModel[];

  amountPlanned?: number;
  amountActual?: number;
  budgetDetailId?: number;

}
