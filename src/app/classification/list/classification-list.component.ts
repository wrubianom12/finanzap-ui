import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { catchError, of } from 'rxjs';
import ChartDonutComponent from '../../core/components/chart/donut/chart-donut.component';
import ChartPieComponent from '../../core/components/chart/pie/chart-pie.component';
import { ClassificationModel } from '../../core/model/ClassificationModel';
import { ClassificationService } from '../../service/ClassificationService.service';


@Component({
  selector: 'app-classification-list',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule,
    ColorPickerModule,
    NgApexchartsModule, ChartDonutComponent, ChartPieComponent],
  templateUrl: './classification-list.component.html',
  styleUrls: ['./classification-list.component.scss']
})
export default class ClassificationListComponent {

  classificationList: ClassificationModel[] = [];

  constructor(public classificationService_: ClassificationService, private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.classificationService_.getAllClassification().pipe(
      catchError(error => {
        console.log('Error delete a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.classificationList = data;
      }
    );
  }

  onSelectClassification(classification: ClassificationModel) {
    this.router.navigate(['/classification/' + classification.id]);
  }

}
