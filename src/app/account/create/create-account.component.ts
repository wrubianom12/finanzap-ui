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
import { DetailCreditAccount } from '../../core/model/DetailCreditAccount';


@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbDropdownModule, ColorPickerModule],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export default class CreateAccountComponent {

  currentAccount: Account = { accountId: undefined, name: '', balance: 0, accountType: '' };
  isCreatingAccount: boolean;

  isCreditAccount: boolean;

  accountForm: FormGroup;
  accountsTypes: KeyValueParameter[] = [
    {
      key: 'Credit',
      value: 'Credit'
    },
    {
      key: 'Debit',
      value: 'Debit'
    }
  ];

  constructor(public accountService_: AccountService, private activatedRoute: ActivatedRoute, private router: Router) {
    this.accountForm = new FormGroup({
      name: new FormControl('', Validators.required),
      balance: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
      accountType: new FormControl('', Validators.required),
      active: new FormControl(''),

      totalAmount: new FormControl(''),
      cutDate: new FormControl(''),
      payDate: new FormControl('')
    });

    this.isCreatingAccount = true;
    this.isCreditAccount = false;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.currentAccount = { accountId: undefined, name: '', balance: 0, accountType: '' };
    this.isCreatingAccount = true;
    const accountParameter = this.activatedRoute.snapshot.paramMap.get('accountId');
    if (accountParameter === 'c') {
      this.isCreatingAccount = true;
      this.accountForm.reset();
      this.accountForm.reset({
        name: '',
        balance: null,
        accountType: '',
        active: true
      });
    } else {
      this.isCreatingAccount = false;
      this.accountService_.getAccountByAccountId(Number(accountParameter)).subscribe(
        data => {
          this.currentAccount = data;

          console.log('La data es ' + JSON.stringify(this.currentAccount.detailCreditAccount?.payDate));

          this.accountForm.setValue({
            name: data.name,
            balance: data.balance.toString(),
            accountType: data.accountType,
            active: data.active,
            totalAmount: data?.detailCreditAccount?.totalAmount ?? '',
            cutDate: data?.detailCreditAccount?.cutDate ?? '',
            payDate: data?.detailCreditAccount?.payDate ?? ''
          });

          this.accountForm.patchValue({
            cutDate: this.formatDate(data?.detailCreditAccount?.cutDate ?? ''),
            payDate: this.formatDate(data?.detailCreditAccount?.payDate ?? ''),
            accountType: data.accountType
          });

          if (data.accountType === 'Credit') {
            this.isCreditAccount = true;
          }

        },
        error => {
          console.log('error finding account', error);
        }
      );
    }

    const balanceControl = this.accountForm.get('balance');
    const accountTypeControl = this.accountForm.get('accountType');
    if (balanceControl) {
      if (this.isCreatingAccount) {
        balanceControl.enable();
      } else {
        balanceControl.disable();
      }
    }
    if (accountTypeControl) {
      if (this.isCreatingAccount) {
        accountTypeControl.enable();
      } else {
        accountTypeControl.disable();
      }
    }
  }

  onSubmit() {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.valid) {

      const accountData: Account = {
        ...this.accountForm.value,
        userId: undefined
      };

      if (this.currentAccount.accountType === 'Credit') {
        const detailCreditAccount: DetailCreditAccount = {
          totalAmount: this.accountForm.value.totalAmount,
          cutDate: this.addTimeToDate(this.accountForm.value.cutDate),
          payDate: this.addTimeToDate(this.accountForm.value.payDate)
        };
        detailCreditAccount.detailCreditAccountId = this.currentAccount.detailCreditAccount?.detailCreditAccountId;
        accountData.detailCreditAccount = detailCreditAccount;
        accountData.detailCreditAccount.cutDate = this.addTimeToDate(this.accountForm.value.cutDate);
        accountData.detailCreditAccount.payDate = this.addTimeToDate(this.accountForm.value.payDate);
      }
      console.log('El update onSubmit es :::::::::::::: ' + JSON.stringify(accountData));

      if (this.isCreatingAccount) {
        this.createAccount(accountData);
        this.router.navigate(['/account-list']);
      } else {
        this.updateAccount(accountData);
        this.router.navigate(['/account-list']);
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  createAccount(accountData: Account) {
    this.accountService_.createAccount(accountData).subscribe(
      data => {
        console.log('' + data);
      },
      error => {
        console.log('error create account', error);
      }
    );
  }

  updateAccount(accountData: Account) {
    accountData.accountId = this.currentAccount.accountId;
    console.log('El update account es :::::::::::::: ' + JSON.stringify(accountData));
    this.accountService_.updateAccount(accountData).subscribe(
      data => {
        console.log('' + data);
      },
      error => {
        console.log('error create account', error);
      }
    );
  }


  clickSelectAccountType(event: any) {
    this.isCreditAccount = false;
    if (event.target.value === 'Credit') {
      this.isCreditAccount = true;
    }
  }

  addTimeToDate(dateInput: string): string {

    const hours = '00';
    const minutes = '00';
    const seconds = '00';

    const timeString = `${hours}:${minutes}:${seconds}`;
    return `${dateInput}T${timeString}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan desde 0
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


}
