import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import TransactionListComponent from '../../transaction/list/transaction-list.component';
import ChartDonutComponent from '../../core/components/chart/donut/chart-donut.component';
import { Budget } from '../../core/model/Budget';
import { BudgetService } from '../../service/BudgetService.service';

@Component({
  selector: 'app-buget',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule,
    TransactionListComponent, ChartDonutComponent],
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss']
})
export default class BudgetComponent {

  budgetList: Budget[] = [];
  currentBudget: Budget = {
    id: undefined,
    userId: undefined,
    baseAmount:0,
    name: '',
    totalActual: 0,
    totalPlanned: 0
  };


  constructor(public budgetService_: BudgetService, private router: Router) {

  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loadBudgetUser();
  }

  loadBudgetUser() {
    this.budgetService_.getAllBudget().pipe(
      catchError(error => {
        console.log('Error loadBudgetUser', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.budgetList = data;
      }
    );
  }

  onEditBudget(budget: Budget) {
    this.currentBudget = budget;
    this.router.navigate(['/budget/' + budget.id]);
  }

  onSelectBudget(budget: Budget) {
    this.currentBudget = budget;
  }

  onSelectDeleteBudger(budget: Budget) {
    if (budget.id) {
      Swal.fire({
        title: 'Are you sure you want to remove this?',
        text: 'You will not be able to recover this budget!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          if (budget.id) this.deleteBudget(budget.id);
        }
      });
    }
  }

  deleteBudget(budgetId: number) {
    this.budgetService_.deleteBudgetByBudgetId(budgetId).pipe(
      catchError(error => {
        console.log('Error delete a Budget', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The Budget was deleted', 'success');
        this.loadBudgetUser();
      }
    );
  }

}
