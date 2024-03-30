import { ComponentFixture, TestBed } from '@angular/core/testing';

import ClassificationListComponent from './classification-list.component';

describe('ClassificationListComponent', () => {
  let component: ClassificationListComponent;
  let fixture: ComponentFixture<ClassificationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClassificationListComponent]
    });
    fixture = TestBed.createComponent(ClassificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
