import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AccountService } from '../../service/AccountService.service';
import { Account } from '../../core/model/Account';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TransactionService } from '../../service/TransactionService.service';
import { Transaction } from '../../core/model/Transaction';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export default class TransactionListComponent {

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


  clickSelectAccount(event: any) {
    const selectedAccountId = event.target.value;
    console.log('Selected Account ID:', selectedAccountId);
    this.findTransactionsById(selectedAccountId);
  }

  findTransactionsById(accountId: number) {
    this.transactionService_.getAllTransactionByAccountId(accountId).subscribe(
      data => {
        this.transactions = data;
      },
      error => {
        console.log('error consume getAllTransactionByAccountId ', error);
      }
    );
  }


}
