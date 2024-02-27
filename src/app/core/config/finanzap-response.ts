import { FinanzapError } from './finanzap-error';

export interface IFinanzapResponse<T> {
  response: T;
  error?: FinanzapError;
}

export class FinanzapResponse<T> implements IFinanzapResponse<T> {
  constructor(public response: T, public error?: FinanzapError) {
  }
}
