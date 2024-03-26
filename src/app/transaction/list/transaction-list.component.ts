import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { Account } from '../../core/model/Account';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TransactionService } from '../../service/TransactionService.service';
import { Transaction } from '../../core/model/Transaction';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import ChartDonutComponent from '../../core/components/chart/donut/chart-donut.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyValueParameter } from '../../core/model/KeyValueParameter';
import { TransactionTypeService } from '../../service/TransactionTypeService.service';
import { Category } from '../../core/model/Category';
import ChartPieComponent from '../../core/components/chart/pie/chart-pie.component';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule,
    ColorPickerModule,
    NgApexchartsModule, ChartDonutComponent, ChartPieComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export default class TransactionListComponent {

  @Input()
  set datoRecibido(accountId: number) {
    this.principalComponent = false;
    this.currentAccountId = accountId;
    this.findTransactionsById(accountId);
  }

  transactionSearchForm: FormGroup;
  itemsChartTotalTransactions: { label: string; value: number; }[] = [];
  itemsChartGroupByCategories: { label: string; value: number; }[] = [];
  itemsChartSumAmountTransactions: { label: string; value: number; }[] = [];
  principalComponent: boolean = true;
  accounts: Account[] = [];
  transactionsType: KeyValueParameter[] = [];
  categoryTypesFilter: KeyValueParameter[] = [];
  transactions: Transaction[] = [];
  currentAccountId: number = 0;

  constructor(public accountService_: AccountService, public transactionTypeService_: TransactionTypeService, public transactionService_: TransactionService, private router: Router) {
    this.transactionSearchForm = new FormGroup({
      transactionType: new FormControl(''),
      categoryFilterType: new FormControl(''),
      firstDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.accountService_.getAllAccountByUserId().subscribe(
      data => {
        this.accounts = data;
      },
      error => {
        console.log('error consume getAllTransactionByAccountId ', error);
      }
    );
    this.transactionTypeService_.getAllTransactionType().subscribe(
      data => {
        this.transactionsType = data;
        this.transactionsType.push({ key: '', value: 'All types' });
      },
      error => {
        console.log('error getAllTransactionType', error);
      }
    );
  }


  onSelectTransaction(transaction: Transaction) {

    this.router.navigate(['/transaction/' + transaction.transactionId]);
  }

  onDeleteTransaction(transaction: Transaction) {
    if (transaction.transactionId) {
      Swal.fire({
        title: 'Are you sure you want to remove this?',
        text: 'You will not be able to recover this transaction!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          if (transaction.transactionId) this.deleteTransaction(transaction.transactionId, transaction.accountId);
        }
      });
    }
  }

  deleteTransaction(categoryId: number, accountId: number) {
    this.transactionService_.deleteTransactionByTransactionId(categoryId).pipe(
      catchError(error => {
        console.log('Error delete a category', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The. transaction was deleted', 'success');
        this.findTransactionsById(accountId);
      }
    );
  }

  clickSelectAccount(event: any) {
    const selectedAccountId = event.target.value;
    this.currentAccountId = selectedAccountId;
    this.findTransactionsById(selectedAccountId);
  }

  findTransactionsById(accountId: number) {
    this.transactionService_.getAllTransactionByAccountId(accountId).subscribe(
      data => {
        this.transactions = data;
        this.loadChars();
        this.loadSpecificCategories();
      },
      error => {
        console.log('error consume getAllTransactionByAccountId ', error);
      }
    );
  }

  loadSpecificCategories() {
    this.categoryTypesFilter = [];
    const uniqueCategories: KeyValueParameter[] = this.transactions.reduce((acc: KeyValueParameter[], current: Transaction) => {
      // Busca si la categoría ya existe en el acumulador
      const categoryIndex = acc.findIndex(category => category.key === current.category);

      if (categoryIndex === -1) {
        // Si no existe, añade la categoría al acumulador con un conteo inicial de 1
        // y establece el valor inicial de value2 como el valor de la transacción actual
        acc.push({ key: current.category, value: `1`, value2: `${(current.value)}` });
      } else {
        acc[categoryIndex].value = (parseInt(acc[categoryIndex].value, 10) + 1).toString();
        acc[categoryIndex].value2 = `${((Number(acc[categoryIndex].value2) + Number(current.value)))}`;
      }
      return acc;
    }, []);
    uniqueCategories.forEach(
      cate => {
        this.categoryTypesFilter.push({
          key: cate.key,
          value: cate.value,
          value2: cate.value2,
          label: (cate.key + ' - ' + cate.value)
        });
      }
    );
    this.categoryTypesFilter.push({ key: '', value: 'All types', label: 'All types' });
    this.loadDataChartGroupByCategories();
  }


  loadChars() {
    this.loadDataChartTotalTransactions();
    this.loadDataChartSumAmountTransactions();
  }

  loadDataChartGroupByCategories() {
    this.itemsChartGroupByCategories = [];
    this.categoryTypesFilter.forEach(
      param => {
        this.itemsChartGroupByCategories.push({
          label: param.key,
          value: Number(param.value2)
        });
      }
    );
  }

  loadDataChartTotalTransactions() {
    this.itemsChartTotalTransactions = [];
    const countByType = this.transactions.reduce((acc, { type }) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    for (const type in countByType) {
      if (countByType.hasOwnProperty(type)) {
        this.itemsChartTotalTransactions.push({
          label: type,
          value: countByType[type]
        });

      }
    }
  }


  loadDataChartSumAmountTransactions() {
    this.itemsChartSumAmountTransactions = [];
    const countByType = this.transactions.reduce((acc, { type, value }) => {
      acc[type] = (acc[type] || 0) + Number(value);
      return acc;
    }, {} as { [key: string]: number });

    for (const type in countByType) {
      if (countByType.hasOwnProperty(type)) {
        this.itemsChartSumAmountTransactions.push({
          label: type,
          value: countByType[type]
        });
      }
    }
  }

  search() {
    this.transactionService_
      .getAllTransactionByCriteria(this.currentAccountId,
        this.addTimeToDate(this.transactionSearchForm.value.firstDate),
        this.addTimeToDate(this.transactionSearchForm.value.endDate),
        this.transactionSearchForm.value.transactionType,
        this.transactionSearchForm.value.categoryFilterType)
      .subscribe(
        data => {
          this.transactions = data;
          this.loadChars();
          this.loadSpecificCategories();
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


}
