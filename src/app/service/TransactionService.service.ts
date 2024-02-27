import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../core/model/Transaction';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  private resourceUrl = 'http://localhost:8083/api/v1/transaction';


  constructor(private http: HttpClient) {
  }

  getAllTransactionByAccountId(accountId: number): Observable<any> {
    return this.http.get(`${this.resourceUrl}/${accountId}`);
  }

  createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(`${this.resourceUrl}`, transaction);
  }

}
