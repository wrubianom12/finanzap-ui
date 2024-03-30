import { Category } from './Category';

export interface ClassificationModel {
  id?: number,
  code: string;
  name: string;
  percent: number;
  categories?: Category[]
}
