import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../core/model/Category';
import { CategoryService } from '../../service/CategoryService.service';
import { KeyValueParameter } from '../../core/model/KeyValueParameter';
import { TransactionTypeService } from '../../service/TransactionTypeService.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';
import { ClassificationModel } from '../../core/model/ClassificationModel';
import { ClassificationService } from '../../service/ClassificationService.service';

@Component({
  selector: 'app-create-classification',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.scss']
})
export default class ClassificationComponent {


  classificationTypeForm: FormGroup;
  currentClassification: ClassificationModel = { id: undefined, name: '', code: '', percent: 0 };
  isCreatingClaasificationForm: boolean;
  filterCategory: string = '';
  filterClassificationPresence: string = 'all';
  filterTransactionType: string = '';
  categories: Category[] = [];
  transactionsType: KeyValueParameter[] = [];

  constructor(public categoryService_: CategoryService,
              public classificationService_: ClassificationService,
              public transactionTypeService_: TransactionTypeService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.isCreatingClaasificationForm = true;
    this.classificationTypeForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      code: new FormControl(null, [Validators.required]),
      percent: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)])
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.filterCategory = '';
    this.filterTransactionType = '';
    this.loadTransactionType();
    this.currentClassification = { id: undefined, name: '', code: '', percent: 0 };
    this.isCreatingClaasificationForm = true;

    const classificationParameter = this.activatedRoute.snapshot.paramMap.get('classificationId');
    if (classificationParameter === 'c') {
      this.loadAllCategories();
      this.isCreatingClaasificationForm = true;
      this.classificationTypeForm.reset();
      this.classificationTypeForm.reset({
        id: undefined,
        name: '',
        code: '',
        percent: undefined
      });
    } else {
      this.isCreatingClaasificationForm = false;
      this.classificationService_.getClassificationById(Number(classificationParameter)).pipe(
        catchError(error => {
          console.log('Error al cargar la clasificacion', error);
          return of({ id: undefined, name: '', code: '', percent: 0 });
        })
      ).subscribe(data => {
          this.currentClassification = data;
          this.classificationTypeForm.reset({
            id: this.currentClassification.id,
            name: this.currentClassification.name,
            code: this.currentClassification.code,
            percent: this.currentClassification.percent
          });
          if (this.currentClassification && this.currentClassification.categories) {
            this.markSelectedCategories(this.currentClassification.categories);
          }
        }
      );
    }
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

  markSelectedCategories(currentcategories: Category[]) {
    this.categoryService_.getAllCategories().pipe(
      catchError(error => {
        console.log('Error al cargar las categorías', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.categories = data;
        const selectedCategoryIds = new Set(currentcategories.map(cat => cat.categoryId));
        this.categories.forEach(cat => {
          cat.selected = selectedCategoryIds.has(cat.categoryId);
        });
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
      if (listCategoriesSelected && listCategoriesSelected.length > 0) {
        classificationData.categories = listCategoriesSelected;

        this.createClassification(classificationData);

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
        this.router.navigate(['/classification-list']);
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
        Swal.fire('', 'The classification was updated', 'success');
        this.loadAllCategories();
        this.resetForm();
        this.router.navigate(['/classification-list']);
      }
    );
  }


  resetForm() {
    this.isCreatingClaasificationForm = true;
    this.validButton();
    this.classificationTypeForm.reset({
      id: null,
      name: '',
      code: '',
      transactionTypeEnum: ''
    });
  }

  validButton() {

  }

  get filteredCategories() {
    return this.categories.filter(category => {
      const matchesName = category.name.toLowerCase().includes(this.filterCategory.toLowerCase());
      const matchesTransactionType = category.transactionTypeEnum.toLowerCase().includes(this.filterTransactionType.toLowerCase());

      let matchesClassificationFilter: undefined | boolean = true; // Por defecto, incluimos todas las categorías.

      // Aplicamos el filtro de clasificación según la opción seleccionada.
      if (this.filterClassificationPresence === 'with') {
        matchesClassificationFilter = category.classifications && category.classifications.length > 0;
      } else if (this.filterClassificationPresence === 'without') {
        matchesClassificationFilter = !category.classifications || category.classifications.length === 0;
      }

      return matchesName && matchesTransactionType && matchesClassificationFilter;
    });
  }

  getSelectedCategories(): Category[] {
    return this.categories.filter(category => category.selected);
  }

}
