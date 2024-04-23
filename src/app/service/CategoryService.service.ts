import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError, of } from 'rxjs';
import { Category } from '../core/model/Category';
import { switchMap, tap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class CategoryService {

  private resourceUrl = 'http://localhost:8084/api/v1/transversal/category';
  private categoriesCache: Category[] = [];

  constructor(private http: HttpClient) {
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.resourceUrl}`);
  }

  getCategorybyCode(code: string): Observable<Category> {
    return this.categoriesCache.length > 0 ? this.getCategorybyCodeCache(code) : this.fetchAndCacheCategories().pipe(
      switchMap(() => this.getCategorybyCodeCache(code))
    );
  }

  private fetchAndCacheCategories(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      tap(categories => this.categoriesCache = categories),
      catchError(error => {
        console.log('error fetching categories', error);
        return of([]);
      })
    );
  }

  getCategorybyCodeCache(code: string): Observable<Category> {
    const category = this.categoriesCache.find(category => category.code === code);
    if (category) {
      return of(category);
    } else {
      // Si no se encuentra la categoría, lanza un error.
      return throwError(new Error('Category not found'));
    }
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


  getCategoryById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(`${this.resourceUrl}/${categoryId}`);
  }


  getAllCategoryByTransactionType(transactionType: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.resourceUrl}/search?categoryType=${transactionType}`);
  }

}
