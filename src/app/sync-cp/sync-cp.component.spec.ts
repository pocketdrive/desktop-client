import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncCpComponent } from './sync-cp.component';

describe('SyncCpComponent', () => {
  let component: SyncCpComponent;
  let fixture: ComponentFixture<SyncCpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncCpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncCpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
