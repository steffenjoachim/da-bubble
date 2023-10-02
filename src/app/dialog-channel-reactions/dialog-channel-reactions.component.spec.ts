import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelReactionsComponent } from './dialog-channel-reactions.component';

describe('DialogChannelReactionsComponent', () => {
  let component: DialogChannelReactionsComponent;
  let fixture: ComponentFixture<DialogChannelReactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogChannelReactionsComponent]
    });
    fixture = TestBed.createComponent(DialogChannelReactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
