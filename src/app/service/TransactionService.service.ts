import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountService {

  private resourceUrl = 'http://localhost:8083/api/v1/transaction';


  constructor(private http: HttpClient) {
  }

  getAllTransactionByAccountId(): Observable<any> {
    return this.http.get(`${this.resourceUrl}/2`);
  }

}
