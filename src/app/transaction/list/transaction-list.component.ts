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


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule,
    ColorPickerModule,
    NgApexchartsModule, ChartDonutComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export default class TransactionListComponent {

  @Input()
  set datoRecibido(accountId: number) {
    this.principalComponent = false;
    this.findTransactionsById(accountId);
  }

  itemsChart: { label: string; value: number; }[] = [];
  principalComponent: boolean = true;
  accounts: Account[] = [];
  transactions: Transaction[] = [];

  constructor(public accountService_: AccountService, public transactionService_: TransactionService, private router: Router) {
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
  }


  onSelectTransaction(transaction: Transaction) {
    console.log('la cuenta es ' + JSON.stringify(transaction));
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
    console.log('Selected Account ID:', selectedAccountId);
    this.findTransactionsById(selectedAccountId);
  }

  findTransactionsById(accountId: number) {
    this.transactionService_.getAllTransactionByAccountId(accountId).subscribe(
      data => {
        this.transactions = data;
        this.loadDataChart();
      },
      error => {
        console.log('error consume getAllTransactionByAccountId ', error);
      }
    );
  }

  loadDataChart() {
    this.itemsChart = [];
    const countByType = this.transactions.reduce((acc, { type }) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    for (const type in countByType) {
      if (countByType.hasOwnProperty(type)) {
        this.itemsChart.push({
          label: type,
          value: countByType[type]
        });

      }
    }
  }


}
