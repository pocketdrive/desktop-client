import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncPpComponent } from './sync-pp.component';

describe('SyncPpComponent', () => {
  let component: SyncPpComponent;
  let fixture: ComponentFixture<SyncPpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncPpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncPpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
