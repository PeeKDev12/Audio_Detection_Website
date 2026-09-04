import { ComponentFixture, TestBed } from '@angular/core/testing';

import {PredictionHistoryComponent } from './predict-history';

describe('PredictionHistoryComponent', () => {
  let component: PredictionHistoryComponent;
  let fixture: ComponentFixture<PredictionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
