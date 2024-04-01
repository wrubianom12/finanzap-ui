import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../service/BudgetService.service';
import { catchError, of } from 'rxjs';
import { Budget } from '../../core/model/Budget';
import { ClassificationModel } from '../../core/model/ClassificationModel';
import { ClassificationService } from '../../service/ClassificationService.service';
import Swal from 'sweetalert2';
import { BudgetDetail } from '../../core/model/BudgetDetail';
import { Category } from '../../core/model/Category';
import { ngDebug } from '@angular/cli/src/utilities/environment-options';


@Component({
  selector: 'app-create-budget',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './create-budget.component.html',
  styleUrls: ['./create-budget.component.scss']
})
export default class CreateBudgetComponent {

  currentClassification: ClassificationModel = { name: '', code: '', percent: 0 };
  classificationsSelected: ClassificationModel[] = [];
  budgetForm: FormGroup;
  classifications: ClassificationModel[] = [];

  isFreezing: boolean = false;

  constructor(public budgetService_: BudgetService,
              public classificationService_: ClassificationService) {
    this.budgetForm = new FormGroup({
      name: new FormControl('Presupuesto general', Validators.required),
      baseAmount: new FormControl(10000000, [Validators.required, Validators.pattern(/^\d+$/)]),
      totalPlanned: new FormControl(0, Validators.required),
      totalActual: new FormControl(0, Validators.required)
    });
    this.isFreezing = false;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadClassifications();
  }

  initForm(): void {

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


  freezingBudget() {
    this.budgetForm.markAllAsTouched();
    if (this.budgetForm.valid) {
      this.isFreezing = true;
    }
  }

  unfreezingBudget() {
    this.isFreezing = false;
  }


  get formattedTotalPlanned(): string {
    const totalPlanned = this.budgetForm.get('totalPlanned')?.value;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalPlanned);
  }

  updateTotalPlanned() {
    let total = 0;
    this.classificationsSelected.forEach(classification => {
      classification?.categories?.forEach(category => {
        const amount = Number(category.amountPlanned) || 0;
        total += amount;
      });
    });
    this.budgetForm.patchValue({
      totalPlanned: total
    });
  }

  addClassificationToBudget() {
    if (this.currentClassification && this.currentClassification.id !== undefined && this.currentClassification.id > 0) {
      const exists = this.classificationsSelected.some(classification =>
        classification.id === this.currentClassification.id
      );
      if (!exists) {
        this.classificationsSelected.push(this.currentClassification);
      } else {
        Swal.fire({
          title: 'Información',
          text: 'La clasificación ya está seleccionada. Por favor, elige otra.',
          icon: 'info',
          confirmButtonText: 'Entendido'
        });
      }
    } else {
      Swal.fire({
        title: 'Información',
        text: 'Seleccione una clasificación',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    }
  }

  addToCurrentClassification(event: any) {
    if (event) {
      const selectedClassification =
        this.classifications.find(classification => classification.code === event.target.value);
      if (selectedClassification) {
        this.currentClassification = selectedClassification;
      }
    }
  }

  validarAmountPlanned(): string[] {
    const classifications: string[] = [];
    for (const classification of this.classificationsSelected) {
      const categoriaSinAmountPlanned = classification.categories?.find(category => category.amountPlanned == null);
      if (categoriaSinAmountPlanned) {
        classifications.push(classification.name);
      }
    }
    return classifications;
  }

  onSubmit() {
    console.log(`Las categorias seleccionadas son ${JSON.stringify(this.classificationsSelected)}`);
    const classificationWithoutCategoriesValid: string[] = this.validarAmountPlanned();
    if (classificationWithoutCategoriesValid.length > 0) {
      Swal.fire({
        title: 'Información',
        text: `Tienes clasificaciones con categorias sin ammount planned ${JSON.stringify(classificationWithoutCategoriesValid)}`,
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    } else {
      const budgetDetailList: BudgetDetail[] = [];
      this.classificationsSelected.forEach(classification => {
        const details = this.convertCategoriesToBudgetDetails(classification.categories, classification.code);
        budgetDetailList.push(...details);
      });

      const budgetData: Budget = {
        ...this.budgetForm.value,
        userId: undefined
      };

      budgetData.budgetDetails = budgetDetailList;
      this.createBudget(budgetData);

    }
  }


  createBudget(budgetData: Budget) {
    this.budgetService_.createBudget(budgetData)
      .pipe(
        catchError(error => {
          console.log('Error al crear createBudget', error);
          Swal.fire({
            title: 'Información',
            text: `Ocurrio un error al crear el presupuesto`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          return of([]);
        })
      ).subscribe(
      data => {
        if (data) {
          Swal.fire({
            title: 'Información',
            text: `Se creó correctamente el presupuesto `,
            icon: 'info',
            confirmButtonText: 'Entendido'
          });
        }
      }
    );
  }

  convertCategoriesToBudgetDetails(categories: Category[] | undefined, classificationCode: string): BudgetDetail[] {
    const budgetDetails: BudgetDetail[] = [];
    categories?.forEach(category => {
      const detail: BudgetDetail = {
        id: undefined,
        categoryType: category.code,
        classificationCode: classificationCode,
        categoryTypeName: category.name,
        amountPlanned: category.amountPlanned ?? 0,
        amountActual: 0
      };
      budgetDetails.push(detail);
    });
    return budgetDetails;
  }


}
