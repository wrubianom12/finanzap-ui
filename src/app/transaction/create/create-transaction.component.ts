import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { KeyValueParameter } from '../../core/model/KeyValueParameter';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Account } from '../../core/model/Account';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from '../../core/model/Transaction';
import { TransactionService } from '../../service/TransactionService.service';


@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export default class CreateAccountComponent {

  currentAccount: Account = { accountId: undefined, name: '', balance: 0, accountType: '' };
  isCreatingTransaction: boolean;
  transactionForm: FormGroup;

  accounts: Account[] = [];
  categories: KeyValueParameter[] = [
    {
      key: 'AL',
      value: 'Alimentos',
      value2: 'EXPENSE'
    },
    {
      key: 'Salary',
      value: 'Salary',
      value2: 'INCOME'
    }
  ];

  transactionsType: KeyValueParameter[] = [
    {
      key: 'INCOME',
      value: 'Income'
    },
    {
      key: 'EXPENSE',
      value: 'Expense'
    }
  ];

  constructor(public accountService_: AccountService,
              public transactionService_: TransactionService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.transactionForm = new FormGroup({
      accountId: new FormControl('', Validators.required),
      value: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
      type: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required)
    });

    this.isCreatingTransaction = true;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.currentAccount = { accountId: undefined, name: '', balance: 0, accountType: '' };
    this.isCreatingTransaction = true;
    this.loadAccounts();
    this.loadFormTransactions();
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
    const accountParameter = this.activatedRoute.snapshot.paramMap.get('transactionId');
    if (accountParameter === 'c' || accountParameter === null) {
      this.isCreatingTransaction = true;
      this.transactionForm.reset();
      this.transactionForm.reset({
        accountId: '',
        value: null,
        type: '',
        date: null,
        category: '',
        description: ''
      });
    } else {
      this.isCreatingTransaction = false;
      this.accountService_.getAccountByAccountId(Number(accountParameter)).subscribe(
        data => {
          console.log('' + data);
          this.currentAccount = data;
          this.transactionForm.setValue({
            name: data.name,
            balance: data.balance.toString(),
            accountType: data.accountType,
            active: data.active
          });
        },
        error => {
          console.log('error finding account', error);
        }
      );
    }
  }

  onCategoryChange(selectedCategory: any) {
    const category =
      this.categories.find(category => category.key === selectedCategory.target.value);
    if (category) {
      this.transactionForm.get('type')?.setValue(category.value2);
      this.transactionForm.patchValue({
        type: category.value2
      });
    }
  }

  onSubmit() {
    const selectedAccountId = this.transactionForm.get('accountId')?.value;
    this.transactionForm.patchValue({
      accountId: selectedAccountId
    });

    console.log('El formulario es::::: ' + JSON.stringify(this.transactionForm.value));

    if (this.transactionForm.valid) {
      const transactionData: Transaction = {
        ...this.transactionForm.value,
        userId: undefined
      };

      transactionData.date = this.convertToISODateTimeWithCurrentTime(transactionData.date);

      if (this.isCreatingTransaction) {
        this.createTransation(transactionData);
      } else {
        this.updateTransaction(transactionData);
        //this.router.navigate(['/transaction-list']);
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  convertToISODateTime(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const isoDateTime = date.toISOString();
    return isoDateTime.split('.')[0] + 'Z';
  }

  convertToISODateTimeWithCurrentTime(dateInput: Date | string): string {
    let date: Date;

    if (typeof dateInput === 'string') {
      date = new Date(dateInput);

      // Si la entrada es una cadena que representa solo una fecha, ajusta la hora al momento actual
      if (dateInput.trim().length <= 10) {
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }
    } else {
      date = dateInput;
    }

    // Convertimos la fecha a formato ISO 8601, incluyendo la hora actual si fue ajustada
    const isoDateTime = date.toISOString();

    return isoDateTime;
  }

  createTransation(transaction: Transaction) {
    this.transactionService_.createTransaction(transaction).subscribe(
      data => {
        this.router.navigate(['/transaction-list']);
      },
      error => {
        console.log('error create transaction', error);
      }
    );
  }

  updateTransaction(transaction: Transaction) {
    //accountData.accountId = this.currentAccount.accountId;
    console.log(JSON.stringify(transaction));
    this.transactionService_.createTransaction(transaction).subscribe(
      data => {
        this.router.navigate(['/transaction-list']);
      },
      error => {
        console.log('error create transaction', error);
      }
    );
  }


}
