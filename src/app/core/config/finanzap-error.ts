export interface IFinanzapError {
  codigoError?: string;
  descripcion?: string;
  identificadorTransaccion?: string;
  usuario?: string;
  trace?: string;
}

export class FinanzapError implements IFinanzapError {
  constructor(
    public codigoError?: string,
    public descripcion?: string,
    public identificadorTransaccion?: string,
    public usuario?: string,
    public trace?: string
  ) {
  }
}
