import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BudgetService } from '../../service/BudgetService.service';
import { catchError, of } from 'rxjs';
import { Budget } from '../../core/model/Budget';
import { ClassificationModel } from '../../core/model/ClassificationModel';
import { ClassificationService } from '../../service/ClassificationService.service';
import Swal from 'sweetalert2';
import { Category } from '../../core/model/Category';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../service/TransactionService.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Transaction } from '../../core/model/Transaction';
import { BudgetDetail } from '../../core/model/BudgetDetail';


@Component({
  selector: 'app-view-budget',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './view-budget.component.html',
  styleUrls: ['./view-budget.component.scss']
})
export default class ViewBudgetComponent {

  budgets: Budget[] = [];
  transactionSearchForm: FormGroup;
  classifications: ClassificationModel[] = [];

  classificationsSelected: ClassificationModel[] = [];
  transactions: Transaction[] = [];

  isFreezing: boolean = false;
  isCreating: boolean = true;
  currentBudget: Budget = { name: '', baseAmount: 0, totalPlanned: 0, totalActual: 0 };

  constructor(public budgetService_: BudgetService,
              private activatedRoute: ActivatedRoute,
              public transactionService_: TransactionService,
              public classificationService_: ClassificationService) {
    this.loadClassifications();
    this.loadBudgets();
    this.transactionSearchForm = new FormGroup({
      transactionType: new FormControl(''),
      categoryFilterType: new FormControl(''),
      firstDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
    this.loadClassifications();
    this.initForm();
  }

  initForm(): void {
    this.isCreating = true;
    const butgetParameter: string | null = this.activatedRoute.snapshot.paramMap.get('budgetId');

  }

  loadBudgets() {
    this.budgetService_.getAllBudget().pipe(
      catchError(error => {
        console.log('Error loadCategories a account', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.budgets = data;
        this.budgets.unshift({ id: 0, name: 'Seleccione una opción', baseAmount: 0, totalPlanned: 0, totalActual: 0 });
      }
    );
  }

  loadClassifications() {
    this.classificationService_.getAllClassification().pipe(
      catchError(error => {
        console.log('Error loadCategories a account', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.classifications = data;
        this.classifications.unshift({ id: 0, name: 'Seleccione una opcion', code: '', percent: 0 });
      }
    );
  }


  selectBudget(event: any) {
    if (event) {
      const selectedBudget =
        this.budgets.find(budget => Number(budget.id) === Number(event.target.value));
      if (selectedBudget) {
        this.currentBudget = selectedBudget;
        const categorias: ClassificationModel[] = this.convertBudgetToClasscification(this.currentBudget);
        this.classificationsSelected = categorias;
        this.updateTotalPlanned();
      }
    }
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////


  convertBudgetToClasscification(budget: Budget): ClassificationModel[] {
    const classificationsMap: { [code: string]: ClassificationModel } = {};
    budget.budgetDetails?.forEach(detail => {
      if (!classificationsMap[detail.classificationCode]) {
        const classc = this.findClassificationByCode(detail.classificationCode);
        if (classc) {
          classificationsMap[detail.classificationCode] = {
            id: classc.id,
            code: classc.code,
            name: classc.name,
            percent: classc.percent,
            categories: []
          };
        }
      }

      const category: Category = {
        budgetDetailId: detail.id,
        categoryId: detail.categoryTypeId,
        code: '',
        name: detail.categoryTypeName,
        transactionTypeEnum: '',
        amountPlanned: detail.amountPlanned
      };
      classificationsMap[detail.classificationCode].categories?.push(category);
    });
    return Object.values(classificationsMap);
  }

  findClassificationByCode(code: string): ClassificationModel | undefined {
    return this.classifications.find(classification => classification.code === code);
  }


  updateTotalPlanned() {
    let total = 0;
    let totalActual = 0;
    this.classificationsSelected.forEach(classification => {
      // Reinicia la suma para esta clasificación.
      let sumClassification = 0;
      let sumAmountActual = 0;
      classification?.categories?.forEach(category => {
        const amount = Number(category.amountPlanned) || 0;
        total += amount;
        sumClassification += amount; // Suma correctamente para la clasificación actual.

        const amountActual = Number(category.amountActual) || 0;
        totalActual += amountActual;
        sumAmountActual += amountActual;
      });
      // Asigna la suma calculada a la propiedad de la clasificación.
      classification.sumClassification = sumClassification;
      classification.sumAmountActual = sumAmountActual;
    });
    this.updateClassificationsWithSortedCategories();
    this.currentBudget.totalPlanned = total;
    this.currentBudget.totalActual = totalActual;
  }

  updateClassificationsWithSortedCategories() {
    this.classificationsSelected.forEach(classification => {
      if (classification.categories) {
        classification.categories.sort((a, b) => {
          // Asignar un valor predeterminado de 0 si amountPlanned es undefined
          const amountA = a.amountPlanned ?? 0;
          const amountB = b.amountPlanned ?? 0;
          return amountB - amountA;
        });
      }
    });
  }


  search() {
    this.transactionService_
      .getAllTransactionByCriteriaAll(this.addTimeToDate(this.transactionSearchForm.value.firstDate),
        this.addTimeToDate(this.transactionSearchForm.value.endDate),
        this.transactionSearchForm.value.transactionType,
        this.transactionSearchForm.value.categoryFilterType)
      .subscribe(
        data => {
          this.transactions = data;

          this.loadTransactionsOnBudget();
        },
        error => {
          console.log('error consume getAllTransactionByCriteria ', error);
        }
      );
  }

  addTimeToDate(dateInput: string): string {

    if (dateInput !== null && dateInput !== undefined && dateInput !== '') {
      const hours = '00';
      const minutes = '00';
      const seconds = '00';
      const timeString = `${hours}:${minutes}:${seconds}`;
      return `${dateInput}T${timeString}`;
    }
    return '';
  }

  loadTransactionsOnBudget() {
    this.classificationsSelected.forEach(budget => {
      if (budget.categories) {

        budget.categories.forEach(detail => {
          detail.amountActual = 0;
        });

        budget.categories.forEach(detail => {
          if (detail.amountActual === undefined) {
            detail.amountActual = 0;
          }
          const matchingTransactions = this.transactions.filter(t => t.category === detail.categoryId);
          const totalAmountActual = matchingTransactions.reduce((sum, t) => sum + t.value, 0);
          detail.amountActual += totalAmountActual;
        });
      }
    });
    this.updateTotalPlanned();
  }


}
