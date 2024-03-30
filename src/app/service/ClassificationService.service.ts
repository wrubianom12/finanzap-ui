import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../core/model/Category';
import { Observable } from 'rxjs';
import { ClassificationModel } from '../core/model/ClassificationModel';


@Injectable({ providedIn: 'root' })
export class ClassificationService {

  private resourceUrl = 'http://localhost:8084/api/v1/transversal/classification';

  constructor(private http: HttpClient) {
  }

  createClassification(classificationModel: ClassificationModel): Observable<string> {
    return this.http.post<string>(`${this.resourceUrl}`, classificationModel);
  }

  updateClassification(classificationModel: ClassificationModel): Observable<string> {
    return this.http.put<string>(`${this.resourceUrl}`, classificationModel);
  }


}
