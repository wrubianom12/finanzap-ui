import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Account } from '../../core/model/Account';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from '../../core/model/Transaction';
import { TransactionService } from '../../service/TransactionService.service';
import { CategoryService } from '../../service/CategoryService.service';
import { catchError, of } from 'rxjs';
import { Category } from '../../core/model/Category';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { KeyValueParameter } from '../../core/model/KeyValueParameter';
import { TransactionTypeService } from '../../service/TransactionTypeService.service';


@Component({
  selector: 'app-create-transaction',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export default class CreateTransactionComponent {

  currentTransaction: Transaction = { accountId: 1, value: 1, category: '', description: '', date: '', type: '' };
  isCreatingTransaction: boolean;
  transactionForm: FormGroup;
  transactionsType: KeyValueParameter[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];

  constructor(public accountService_: AccountService,
              public transactionService_: TransactionService,
              public categoryService_: CategoryService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              public transactionTypeService_: TransactionTypeService,
              private router: Router) {
    this.transactionForm = new FormGroup({
      accountId: new FormControl('', Validators.required),
      value: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
      type: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      transactionType: new FormControl('')
    });

    this.isCreatingTransaction = true;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.currentTransaction = { accountId: 1, value: 1, category: '', description: '', date: '', type: '' };
    this.isCreatingTransaction = true;
    this.loadAccounts();
    this.loadFormTransactions();
    this.loadCategories();
  }


  loadCategories() {

    this.transactionTypeService_.getAllTransactionType().pipe(
      catchError(error => {
        console.log('error getAllTransactionType', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.transactionsType = data;
      }
    );
  }


  loadAccounts() {
    this.accountService_.getAllAccountByUserId().subscribe(
      data => {
        this.accounts = data;
      },
      error => {
        console.log('error consume getAccounts ', error);
      }
    );
  }

  loadFormTransactions() {
    const transactionParameter = this.activatedRoute.snapshot.paramMap.get('transactionId');
    if (transactionParameter === 'c' || transactionParameter === null) {
      this.isCreatingTransaction = true;
      this.transactionForm.reset();
      this.transactionForm.reset({
        accountId: '',
        value: null,
        type: '',
        date: null,
        transactionType: '',
        category: '',
        description: ''
      });
    } else {
      this.isCreatingTransaction = false;
      this.transactionService_.getTransactionByTransactionId(Number(transactionParameter)).subscribe(
        data => {
          console.log('' + JSON.stringify(data));
          this.currentTransaction = data;
          this.transactionForm.setValue({
            accountId: data.accountId,
            value: data.value,
            type: data.type,
            date: data.date,
            category: data.category,
            transactionType: data.type,
            description: data.description
          });
          this.fillCategoriesByTransactionType(data.type);
          this.transactionForm.patchValue({
            category: data.category
          });
          const date = this.formatDate(data.date);
          this.transactionForm.patchValue({
            date: date
          });
        },
        error => {
          console.log('error finding account', error);
        }
      );
    }
  }

  onTransactionTypeChange(selectedTransactionType: any) {
    this.fillCategoriesByTransactionType(selectedTransactionType.target.value);
  }


  fillCategoriesByTransactionType(selectedTransactionType: any) {
    this.categoryService_.getAllCategoryByTransactionType(selectedTransactionType).pipe(
      catchError(error => {
        console.log('Error delete a account', error);
        return of([]);
      })
    ).subscribe(
      data => {
        this.categories = data;
      }
    );
  }


  onCategoryChange(selectedCategory: any) {
    const category =
      this.categories.find(category => (category.code) === (selectedCategory.target.value));
    if (category) {
      this.transactionForm.get('type')?.setValue(category.transactionTypeEnum);
      this.transactionForm.patchValue({
        type: category.transactionTypeEnum
      });
    }
  }

  onSubmit() {
    this.transactionForm.markAllAsTouched();
    const selectedAccountId = this.transactionForm.get('accountId')?.value;
    this.transactionForm.patchValue({
      accountId: selectedAccountId
    });
    if (this.transactionForm.valid) {
      const transactionData: Transaction = {
        ...this.transactionForm.value
      };
      transactionData.date = this.convertToISODateTimeWithCurrentTime(transactionData.date);
      if (this.isCreatingTransaction) {
        this.createTransation(transactionData);
      } else {
        this.updateTransaction(transactionData);
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan desde 0
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  convertToISODateTimeWithCurrentTime(dateInput: Date | string): string {
    let date: Date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
      if (dateInput.trim().length <= 10) {
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
    } else {
      date = dateInput;
    }
    const isoDateTime = date.toISOString();
    return isoDateTime;
  }

  createTransation(transaction: Transaction) {
    this.transactionService_.createTransaction(transaction).subscribe(
      data => {
        Swal.fire('', 'The transaction was created', 'success');
        this.location.back();
      },
      error => {
        console.log('error create transaction', error);
      }
    );
  }

  updateTransaction(transaction: Transaction) {
    transaction.transactionId = this.currentTransaction.transactionId;
    console.log(JSON.stringify(transaction));
    this.transactionService_.updateTransaction(transaction).subscribe(
      data => {
        Swal.fire('', 'The transaction was updated', 'success');
        this.location.back();
      },
      error => {
        console.log('error create transaction', error);
      }
    );
  }


}
