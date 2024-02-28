import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../core/model/Category';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private resourceUrl = 'http://localhost:8084/api/v1/transversal/category';

  constructor(private http: HttpClient) {
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.resourceUrl}`);
  }

  createCategory(category: Category): Observable<string> {
    return this.http.post<string>(`${this.resourceUrl}`, category);
  }

  deleteCategory(categoryId: number): Observable<string> {
    return this.http.delete<string>(`${this.resourceUrl}/${categoryId}`);
  }

  updateCategory(category: Category): Observable<string> {
    return this.http.put<string>(`${this.resourceUrl}`, category);
  }

}
