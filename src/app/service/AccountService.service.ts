import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../core/model/Account';

@Injectable({ providedIn: 'root' })
export class AccountService {

  private resourceUrl = 'http://localhost:8082/api/v1/account';


  constructor(private http: HttpClient) {
  }

  getAllAccountByUserId(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.resourceUrl}`);
  }

  getAccountByAccountId(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.resourceUrl}/${accountId}`);
  }

  deleteAccountByAccountId(accountId: number): Observable<string> {
    return this.http.delete<string>(`${this.resourceUrl}/${accountId}`);
  }

  createAccount(account: Account): Observable<string> {
    return this.http.post<string>(`${this.resourceUrl}`, account);
  }

  updateAccount(account: Account): Observable<string> {
    return this.http.put<string>(`${this.resourceUrl}`, account);
  }

}
