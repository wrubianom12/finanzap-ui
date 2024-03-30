import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../core/model/Category';
import { CategoryService } from '../../service/CategoryService.service';
import { KeyValueParameter } from '../../core/model/KeyValueParameter';
import { TransactionTypeService } from '../../service/TransactionTypeService.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { ClassificationModel } from '../../core/model/ClassificationModel';
import { ClassificationService } from '../../service/ClassificationService.service';
import { Transaction } from '../../core/model/Transaction';

@Component({
  selector: 'app-create-classification',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.scss']
})
export default class ClassificationComponent {


  classificationTypeForm: FormGroup;
  currentClassification: ClassificationModel = { classificationId: undefined, name: '', code: '', percent: 0 };
  isCreatingClaasificationForm: boolean;
  filterCategory: string = '';
  filterTransactionType: string = '';
  categories: Category[] = [];
  transactionsType: KeyValueParameter[] = [];

  constructor(public categoryService_: CategoryService,
              public classificationService_: ClassificationService,
              public transactionTypeService_: TransactionTypeService,
              private router: Router) {
    this.isCreatingClaasificationForm = true;
    this.classificationTypeForm = new FormGroup({
      classificationId: new FormControl(''),
      name: new FormControl('', Validators.required),
      code: new FormControl(null, [Validators.required]),
      percent: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)])
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.currentClassification = { classificationId: undefined, name: '', code: '', percent: 0 };
    this.isCreatingClaasificationForm = true;
    this.loadAllCategories();
    this.loadTransactionType();
  }

  loadTransactionType() {
    this.transactionTypeService_.getAllTransactionType().subscribe(
      data => {
        this.transactionsType = data;
      },
      error => {
        console.log('error getAllTransactionType', error);
      }
    );
  }

  loadAllCategories() {
    this.categoryService_.getAllCategories().pipe(
      catchError(error => {
        console.log('Error al cargar las categorías', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.categories = data;
      }
    );
  }

  onSubmit() {
    this.classificationTypeForm.markAllAsTouched();
    if (this.classificationTypeForm.valid) {
      const classificationData: ClassificationModel = {
        ...this.classificationTypeForm.value
      };
      const listCategoriesSelected = this.getSelectedCategories();

      console.log('El formularios es ' + JSON.stringify(classificationData));
      console.log('Las categorias seleccionadas son  ' + JSON.stringify(listCategoriesSelected));

      if (listCategoriesSelected && listCategoriesSelected.length > 0) {
        classificationData.categories = listCategoriesSelected;
        if (this.isCreatingClaasificationForm) {
          this.createClassification(classificationData);
        } else {
          this.updateClassification(classificationData);
        }
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  createClassification(classificationData: ClassificationModel) {
    this.classificationService_.createClassification(classificationData).pipe(
      catchError(error => {
        console.log('Error created a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The classification was created', 'success');
        this.loadAllCategories();
        this.resetForm();
      }
    );
  }

  updateClassification(classificationData: ClassificationModel) {
    this.classificationService_.updateClassification(classificationData).pipe(
      catchError(error => {
        console.log('Error created a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        console.log(data);
        Swal.fire('', 'The classification was updated', 'success');
        this.loadAllCategories();
        this.resetForm();
      }
    );
  }


  deleteCategory(categoryId: number) {
    this.categoryService_.deleteCategory(categoryId).pipe(
      catchError(error => {
        console.log('Error delete a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The category was deleted', 'success');
        this.loadAllCategories();
      }
    );
  }

  resetForm() {
    this.isCreatingClaasificationForm = true;
    this.validButton();
    this.classificationTypeForm.reset({
      categoryId: null,
      name: '',
      code: '',
      transactionTypeEnum: ''
    });
  }

  validButton() {

  }


  search() {
    this.categoryService_.getAllCategoryByTransactionType(1)
      .pipe(
        catchError(error => {
          console.log('Error al cargar las categorías', error);
          return of([]);
        })
      ).subscribe(
      data => {
        this.categories = data;
      }
    );
  }


  get filteredCategories() {
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.filterCategory.toLowerCase()) &&
      category.transactionTypeEnum.toLowerCase().includes(this.filterTransactionType.toLowerCase())
    );
  }

  getSelectedCategories(): Category[] {
    return this.categories.filter(category => category.selected);
  }

}
