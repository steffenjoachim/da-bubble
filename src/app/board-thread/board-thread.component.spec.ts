import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardThreadComponent } from './board-thread.component';

describe('BoardThreadComponent', () => {
  let component: BoardThreadComponent;
  let fixture: ComponentFixture<BoardThreadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardThreadComponent]
    });
    fixture = TestBed.createComponent(BoardThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
