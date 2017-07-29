import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectpdComponent } from './selectpd.component';

describe('SelectpdComponent', () => {
  let component: SelectpdComponent;
  let fixture: ComponentFixture<SelectpdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectpdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectpdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
