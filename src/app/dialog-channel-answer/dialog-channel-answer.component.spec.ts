import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelAnswerComponent } from './dialog-channel-answer.component';

describe('DialogChannelAnswerComponent', () => {
  let component: DialogChannelAnswerComponent;
  let fixture: ComponentFixture<DialogChannelAnswerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogChannelAnswerComponent]
    });
    fixture = TestBed.createComponent(DialogChannelAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
