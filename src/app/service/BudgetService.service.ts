import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../core/model/Account';
import { Budget } from '../core/model/Budget';

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private resourceUrl = 'http://localhost:8082/api/v1/budget';


  constructor(private http: HttpClient) {
  }


  getAllBudget(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.resourceUrl}`);
  }


  getBudgetByBudgetId(budgetId: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.resourceUrl}/${budgetId}`);
  }

  deleteBudgetByBudgetId(budgetId: number): Observable<Budget> {
    return this.http.delete<Budget>(`${this.resourceUrl}/${budgetId}`);
  }

  createBudget(budget: Budget): Observable<string> {
    return this.http.post<string>(`${this.resourceUrl}`, budget);
  }

  updateBudget(budget: Budget): Observable<string> {
    return this.http.put<string>(`${this.resourceUrl}`, budget);
  }

}
