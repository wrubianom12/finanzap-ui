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


@Component({
  selector: 'app-view-budget',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './view-budget.component.html',
  styleUrls: ['./view-budget.component.scss']
})
export default class ViewBudgetComponent {

  budgets: Budget[] = [];

  classifications: ClassificationModel[] = [];
  currentClassification: ClassificationModel = { name: '', code: '', percent: 0 };
  classificationsSelected: ClassificationModel[] = [];

  isFreezing: boolean = false;
  isCreating: boolean = true;
  currentBudget: Budget = { name: '', baseAmount: 0, totalPlanned: 0, totalActual: 0 };

  constructor(public budgetService_: BudgetService,
              private activatedRoute: ActivatedRoute,
              public classificationService_: ClassificationService) {
    this.loadClassifications();
    this.loadBudgets();
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
        code: detail.categoryType,
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
    this.classificationsSelected.forEach(classification => {
      // Reinicia la suma para esta clasificación.
      let sumClassification = 0;
      classification?.categories?.forEach(category => {
        const amount = Number(category.amountPlanned) || 0;
        total += amount;
        sumClassification += amount; // Suma correctamente para la clasificación actual.
      });
      // Asigna la suma calculada a la propiedad de la clasificación.
      classification.sumClassification = sumClassification;
    });
    this.updateClassificationsWithSortedCategories();
    this.currentBudget.totalPlanned = total;
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

}
