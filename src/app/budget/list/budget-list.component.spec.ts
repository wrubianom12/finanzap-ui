import { ComponentFixture, TestBed } from '@angular/core/testing';

import BudgetComponent from './budget-list.component';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let fixture: ComponentFixture<BudgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BudgetComponent]
    });
    fixture = TestBed.createComponent(BudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
