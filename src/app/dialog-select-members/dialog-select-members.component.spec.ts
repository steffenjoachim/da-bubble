import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSelectMembersComponent } from './dialog-select-members.component';

describe('DialogSelectMembersComponent', () => {
  let component: DialogSelectMembersComponent;
  let fixture: ComponentFixture<DialogSelectMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogSelectMembersComponent]
    });
    fixture = TestBed.createComponent(DialogSelectMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
