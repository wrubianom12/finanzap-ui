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
import { ActivatedRoute } from '@angular/router';


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
  isCreating: boolean = true;
  currentBudget: Budget = { name: '', baseAmount: 0, totalPlanned: 0, totalActual: 0 };

  constructor(public budgetService_: BudgetService,
              private activatedRoute: ActivatedRoute,
              public classificationService_: ClassificationService) {
    this.budgetForm = new FormGroup({});
    this.resetForm();
    this.loadClassifications();
  }

  ngOnInit(): void {
    this.loadClassifications();
    this.initForm();
  }

  initForm(): void {
    this.isCreating = true;
    this.isFreezing = false;
    const butgetParameter: string | null = this.activatedRoute.snapshot.paramMap.get('budgetId');
    if (butgetParameter === 'c') {
      this.resetForm();
    } else {
      this.isCreating = false;
      this.budgetService_.getBudgetByBudgetId(Number(butgetParameter)).pipe(
        catchError(error => {
          console.log('Error al crear createBudget', error);
          Swal.fire({
            title: 'Información',
            text: `Ocurrio un error al traer el presupuesto`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
          return of(null);
        })
      ).subscribe(value => {
        if (value) {
          this.currentBudget = value;
          this.budgetForm.setValue({
            name: value.name,
            baseAmount: value.baseAmount,
            totalPlanned: value.totalPlanned,
            totalActual: value.totalActual
          });
          const categorias: ClassificationModel[] = this.convertBudgetToClasscification(value);
          this.classificationsSelected = categorias;
          this.updateTotalPlanned();
        }
      });
    }
  }

  resetForm() {
    this.budgetForm = new FormGroup({
      name: new FormControl('Presupuesto general', Validators.required),
      baseAmount: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
      totalPlanned: new FormControl(0, Validators.required),
      totalActual: new FormControl(0, Validators.required)
    });
  }

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
    this.budgetForm.patchValue({
      totalPlanned: total
    });
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


  addClassificationToBudget() {
    if (this.currentClassification && this.currentClassification.id !== undefined && this.currentClassification.id > 0) {
      const exists = this.classificationsSelected.some(classification =>
        classification.id === this.currentClassification.id
      );
      if (!exists) {
        this.classificationsSelected.push(this.currentClassification);
      } else {
        this.validateAndAddMoreCategoriesToBudgetDetail();
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
        const details = this.convertCategoriesToBudgetDetails(classification.categories, classification.code, classification.name);
        budgetDetailList.push(...details);
      });
      const budgetData: Budget = {
        ...this.budgetForm.value,
        userId: undefined
      };
      budgetData.budgetDetails = budgetDetailList;
      if (this.isCreating) {
        this.createBudget(budgetData);
      } else {
        budgetData.id = this.currentBudget.id;
        this.updateBudget(budgetData);
      }
    }
  }

  validateAndAddMoreCategoriesToBudgetDetail() {
    const existingClassificationIndex = this.classificationsSelected.findIndex(classification => classification.code === this.currentClassification?.code);

    if (existingClassificationIndex !== -1 && this.currentClassification?.categories) {
      console.log('Encontro la categoria');

      // Asegúrate de que categories es un array, incluso si es vacío, para evitar el problema de tipo.
      const existingCategories = this.classificationsSelected[existingClassificationIndex].categories || [];
      const newCategories: Category[] = this.currentClassification.categories.filter(cat =>
        !existingCategories.some(selectedCat => selectedCat.code === cat.code)
      );

      if (newCategories && newCategories.length > 0) {
        this.classificationsSelected[existingClassificationIndex].categories = existingCategories.concat(newCategories);
      } else {
        Swal.fire({
          title: 'Información',
          text: 'La clasificación ya está seleccionada. Por favor, elige otra.',
          icon: 'info',
          confirmButtonText: 'Entendido'
        });
      }
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

  updateBudget(budgetData: Budget) {
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

  convertCategoriesToBudgetDetails(categories: Category[] | undefined, classificationCode: string, classificationName: string): BudgetDetail[] {
    const budgetDetails: BudgetDetail[] = [];
    categories?.forEach(category => {
      const detail: BudgetDetail = {
        id: category.budgetDetailId,
        categoryTypeId: category.categoryId ? category.categoryId : -1,
        classificationCode: classificationCode,
        classificationName: classificationName,
        categoryTypeName: category.name,
        amountPlanned: category.amountPlanned ?? 0,
        amountActual: 0
      };
      budgetDetails.push(detail);
    });
    return budgetDetails;
  }


}
