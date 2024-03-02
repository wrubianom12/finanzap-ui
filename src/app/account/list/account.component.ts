import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { Account } from '../../core/model/Account';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../demo/dashboard/dash-analytics/dash-analytics.component';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import TransactionListComponent from '../../transaction/list/transaction-list.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule, TransactionListComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export default class AccountComponent {

  chartAccounts!: Partial<ChartOptions>;
  counts = { Credit: 0, Debit: 0 };
  accounts: Account[] = [];
  currentAccount: Account = {
    accountId: undefined,
    userId: undefined,
    active: false,
    balance: 0,
    accountType: '',
    name: ''
  };


  constructor(public accountService_: AccountService, private router: Router) {
    this.chartAccounts = {
      chart: {
        height: 150,
        type: 'donut'
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '10%'
          }
        }
      },
      labels: ['New', 'Return'],
      series: [100, 100],
      legend: {
        show: false
      },
      tooltip: {
        theme: 'datk'
      },
      grid: {
        padding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      colors: ['#4680ff', '#2ed8b6'],
      fill: {
        opacity: [1, 1]
      },
      stroke: {
        width: 0
      }
    };
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loadAccountsUser();
  }

  loadAccountsUser() {
    this.accountService_.getAllAccountByUserId().subscribe(
      data => {
        this.accounts = data;
        this.accounts.forEach(account => {
          if (account.accountType === 'Credit') {
            this.counts.Credit += 1;
          } else if (account.accountType === 'Debit') {
            this.counts.Debit += 1;
          }
        });
        console.log('EL contador es ' + JSON.stringify(this.counts));

        this.chartAccounts.series = [this.counts.Credit, this.counts.Debit];

      },
      error => {
        console.log('error consume getAllTransactionByAccountId ', error);
      }
    );
  }

  onEditAccount(account: Account) {
    this.currentAccount = account;
    this.router.navigate(['/account/' + account.accountId]);
  }

  onSelectAccount(account: Account) {
    this.currentAccount = account;
    //this.router.navigate(['/account/' + account.accountId]);
  }

  onSelectDeleteaccount(account: Account) {
    if (account.accountId) {
      Swal.fire({
        title: 'Are you sure you want to remove this?',
        text: 'You will not be able to recover this account!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          if (account.accountId) this.deleteAccount(account.accountId);
        }
      });
    }
  }

  deleteAccount(accountId: number) {
    this.accountService_.deleteAccountByAccountId(accountId).pipe(
      catchError(error => {
        console.log('Error delete a account', error);
        return of([]);
      })
    ).subscribe(
      data => {
        Swal.fire('', 'The account was deleted', 'success');
        this.loadAccountsUser();
      }
    );
  }

}
