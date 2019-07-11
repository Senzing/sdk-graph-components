import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SzGraphTestComponent } from './graph-test.component';

describe('SzGraphTestComponent', () => {
  let component: SzGraphTestComponent;
  let fixture: ComponentFixture<SzGraphTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SzGraphTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SzGraphTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
