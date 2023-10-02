import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShowEmojisComponent } from './dialog-show-emojis.component';

describe('DialogShowEmojisComponent', () => {
  let component: DialogShowEmojisComponent;
  let fixture: ComponentFixture<DialogShowEmojisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogShowEmojisComponent]
    });
    fixture = TestBed.createComponent(DialogShowEmojisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
