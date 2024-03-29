import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetService } from '../../service/BudgetService.service';
import { catchError, of } from 'rxjs';
import { Budget } from '../../core/model/Budget';
import { BudgetDetail } from '../../core/model/BudgetDetail';
import { Category } from '../../core/model/Category';
import { CategoryService } from '../../service/CategoryService.service';


@Component({
  selector: 'app-create-budget',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './create-budget.component.html',
  styleUrls: ['./create-budget.component.scss']
})
export default class CreateBudgetComponent {

  budgetDetailList: BudgetDetail[] = [];
  budgetDetailForm: FormGroup;
  budgetForm: FormGroup;
  categories: Category[] = [];

  constructor(public budgetService_: BudgetService,
              public categoryService_: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {
    this.budgetForm = new FormGroup({
      name: new FormControl('', Validators.required),
      baseAmount: new FormControl(0, Validators.required),
      totalPlanned: new FormControl(0, Validators.required),
      totalActual: new FormControl(0, Validators.required)
    });
    this.budgetDetailForm = this.fb.group({
      amountPlanned: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
      categoryType: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {

  }

  loadCategories() {
    this.categoryService_.getAllCategories().pipe(
      catchError(error => {
        console.log('Error loadCategories a account', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.categories = data;
      }
    );
  }


  onSubmit() {
    this.budgetForm.markAllAsTouched();
    if (this.budgetForm.valid) {

      const budgetData: Budget = {
        ...this.budgetForm.value,
        userId: undefined
      };
      budgetData.budgetDetails = this.budgetDetailList;
      this.createBudget(budgetData);
    } else {
      console.log('Formulario no válido');
    }
  }

  createBudget(budgetData: Budget) {
    this.budgetService_.createBudget(budgetData)
      .pipe(
        catchError(error => {
          console.log('Error al crear createBudget', error);
          return of([]);
        })
      ).subscribe(
      data => {
        console.log('' + data);
      }
    );
  }

  addBudgetDetailToBudget() {
    console.log('Se agrega detail ' + JSON.stringify(this.budgetDetailForm.value));

    this.budgetDetailForm.markAllAsTouched();
    if (this.budgetDetailForm.valid) {
      const budgetDetail: BudgetDetail = {
        ...this.budgetDetailForm.value,
        id: undefined
      };
      const isPresent = this.hasCategoryType(budgetDetail.categoryType);


      this.categoryService_.getCategorybyCode(budgetDetail.categoryType).pipe(
        catchError(error => {
          console.log('Error loadCategories a account', error);
          return of([]);
        })
      ).subscribe(
        data => {
          if ('name' in data) {
            budgetDetail.categoryTypeName = data.name;
            if (!isPresent) {
              const accum = Number(this.budgetForm.value.totalPlanned) + Number(budgetDetail.amountPlanned);
              this.budgetForm.patchValue({
                totalPlanned: accum,
                totalActual: 0
              });
              this.budgetDetailList.push(budgetDetail);

              this.budgetDetailForm.reset({
                totalPlanned: 0,
                totalActual: 0
              });
            }
          }
        }
      );
    }
  }

  onSelectDeleteBudget(budgetDetail: BudgetDetail) {
    console.log('El busget  eliminar es ' + budgetDetail);
    this.removeBudgetDetailByCategoryType(budgetDetail.categoryType);
  }


  removeBudgetDetailByCategoryType(categoryTypeToRemove: string) {
    this.budgetDetailList = this.budgetDetailList.filter(budgetDetail => budgetDetail.categoryType !== categoryTypeToRemove);
  }


  hasCategoryType(categoryType: string): boolean {
    return this.budgetDetailList.some(budgetDetail => budgetDetail.categoryType === categoryType);
  }

}
