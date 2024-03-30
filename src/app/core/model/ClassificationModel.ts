import { Category } from './Category';

export interface ClassificationModel {
  classificationId?: number,
  code: string;
  name: string;
  percent: number;
  categories?: Category[]
}
