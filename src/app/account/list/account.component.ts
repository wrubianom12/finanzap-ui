import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { Account } from '../../core/model/Account';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import TransactionListComponent from '../../transaction/list/transaction-list.component';
import ChartDonutComponent from '../../core/components/chart/donut/chart-donut.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule,
    TransactionListComponent, ChartDonutComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export default class AccountComponent {

  totalAccounts: number = 0;
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


  // En tu componente AccountComponent

  calculateDisplayBalance(account: Account): string {
    if (!account) return '$0';
    if (account.accountType === 'Credit') {
      const balance = account.balance ?? 0;
      const totalAmount = account.detailCreditAccount?.totalAmount ?? 0;
      const result = totalAmount - balance;

      return result.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    return '';
  }

  isDebtCellHighlighted(account: Account): boolean {
    return account.accountType === 'Credit' && this.calculateDisplayBalance(account) !== null;
  }


}
