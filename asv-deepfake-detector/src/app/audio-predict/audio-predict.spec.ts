import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioPredict } from './audio-predict';

describe('AudioPredict', () => {
  let component: AudioPredict;
  let fixture: ComponentFixture<AudioPredict>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioPredict]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioPredict);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
