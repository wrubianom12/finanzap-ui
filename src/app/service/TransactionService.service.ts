import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../core/model/Transaction';
import { Account } from '../core/model/Account';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  private resourceUrl = 'http://localhost:8083/api/v1/transaction';


  constructor(private http: HttpClient) {
  }

  getAllTransactionByAccountId(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.resourceUrl}/account/${accountId}`);
  }

  getTransactionByTransactionId(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.resourceUrl}/${transactionId}`);
  }

  createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(`${this.resourceUrl}`, transaction);
  }

  updateTransaction(transaction: Transaction): Observable<any> {
    return this.http.put(`${this.resourceUrl}`, transaction);
  }

}
