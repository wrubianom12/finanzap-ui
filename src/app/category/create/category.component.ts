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

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export default class CategoryComponent {

  currentCategory: Category = { categoryId: undefined, name: '', code: '', transactionTypeEnum: '' };
  isCreatingCategoryForm: boolean;
  categoryTypeForm: FormGroup;
  categories: Category[] = [];
  transactionsType: KeyValueParameter[] = [];

  constructor(public categoryService_: CategoryService, public transactionTypeService_: TransactionTypeService, private router: Router) {

    this.categoryTypeForm = new FormGroup({
      categoryId: new FormControl(''),
      name: new FormControl('', Validators.required),
      code: new FormControl(null, [Validators.required]),
      transactionTypeEnum: new FormControl('', Validators.required)
    });
    this.isCreatingCategoryForm = true;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.currentCategory = { categoryId: undefined, name: '', code: '', transactionTypeEnum: '' };
    this.isCreatingCategoryForm = true;
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

    this.categoryTypeForm.markAllAsTouched();

    if (this.categoryTypeForm.valid) {
      const categoryData: Category = {
        ...this.categoryTypeForm.value
      };
      if (this.isCreatingCategoryForm) {
        this.createCategory(categoryData);
      } else {
        categoryData.transactionTypeEnum = this.currentCategory.transactionTypeEnum;
        this.updateAccount(categoryData);
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  createCategory(categoryData: Category) {
    this.categoryService_.createCategory(categoryData).pipe(
      catchError(error => {
        console.log('Error created a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The category was created', 'success');
        this.loadAllCategories();
        this.resetForm();
      }
    );
  }

  updateAccount(categoryData: Category) {
    console.log(JSON.stringify(categoryData));

    this.categoryService_.updateCategory(categoryData).pipe(
      catchError(error => {
        console.log('Error created a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        console.log(data);
        Swal.fire('', 'The category was updated', 'success');
        this.loadAllCategories();
        this.resetForm();
      }
    );
  }

  onSelectEditCategory(category: Category) {
    this.currentCategory = category;
    console.log('la category es ' + JSON.stringify(category));
    this.isCreatingCategoryForm = false;
    this.validButton();
    this.categoryTypeForm.setValue({
      ...category
    });
  }

  onSelectDeleteCategory(category: Category) {
    this.currentCategory = category;
    if (category.categoryId) {
      Swal.fire({
        title: 'Are you sure you want to remove this?',
        text: 'You will not be able to recover this category!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          if (category.categoryId) this.deleteCategory(category.categoryId);
        }
      });
    }
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
    this.isCreatingCategoryForm = true;
    this.validButton();
    this.categoryTypeForm.reset({
      categoryId: null,
      name: '',
      code: '',
      transactionTypeEnum: ''
    });
  }

  validButton() {
    const categoryType = this.categoryTypeForm.get('transactionTypeEnum');
    if (categoryType) {
      if (this.isCreatingCategoryForm) {
        categoryType.enable();
      } else {
        categoryType.disable();
      }
    }
  }


}
