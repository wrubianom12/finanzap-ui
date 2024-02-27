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

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule, NgApexchartsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export default class AccountComponent {

  chartAccounts!: Partial<ChartOptions>;
  counts = { Credit: 0, Debit: 0 };
  accounts: Account[] = [
    {
      accountId: 4,
      userId: 1,
      balance: 3010.00,
      accountType: 'Credit',
      name: 'BBVAs Colombia'
    }
  ];

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


  onSelectAccount(account: Account) {

    console.log('la cuenta es ' + JSON.stringify(account));
    this.router.navigate(['/account/' + account.accountId]);

  }


}
