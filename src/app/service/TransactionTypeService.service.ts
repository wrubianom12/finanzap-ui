import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyValueParameter } from '../core/model/KeyValueParameter';

@Injectable({ providedIn: 'root' })
export class TransactionTypeService {

  private resourceUrl = 'http://localhost:8084/api/v1/transversal/transaction-type';


  constructor(private http: HttpClient) {
  }

  getAllTransactionType(): Observable<KeyValueParameter[]> {
    return this.http.get<KeyValueParameter[]>(`${this.resourceUrl}`);
  }

}
