import { ComponentFixture, TestBed } from '@angular/core/testing';

import ChartPieComponent from './chart-pie.component';

describe('ChartPieComponent', () => {
  let component: ChartPieComponent;
  let fixture: ComponentFixture<ChartPieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartPieComponent]
    });
    fixture = TestBed.createComponent(ChartPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
