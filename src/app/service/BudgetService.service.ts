import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../core/model/Account';
import { Budget } from '../core/model/Budget';

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private resourceUrl = 'http://localhost:8087/api/v1/budget';


  constructor(private http: HttpClient) {
  }

  getBudgetByBudgetId(budgetId: number): Observable<Account> {
    return this.http.get<Account>(`${this.resourceUrl}/${budgetId}`);
  }

  createBudget(budget: Budget): Observable<string> {
    return this.http.post<string>(`${this.resourceUrl}`, budget);
  }

}
