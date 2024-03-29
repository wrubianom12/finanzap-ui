import { ComponentFixture, TestBed } from '@angular/core/testing';

import CreateBudgetComponent from './create-budget.component';

describe('CreateBudgetComponent', () => {
  let component: CreateBudgetComponent;
  let fixture: ComponentFixture<CreateBudgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateBudgetComponent]
    });
    fixture = TestBed.createComponent(CreateBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
