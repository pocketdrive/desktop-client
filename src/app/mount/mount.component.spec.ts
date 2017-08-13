import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MountComponent } from './mount.component';

describe('MountComponent', () => {
  let component: MountComponent;
  let fixture: ComponentFixture<MountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
