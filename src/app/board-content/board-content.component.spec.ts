import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardContentComponent } from './board-content.component';

describe('BoardContentComponent', () => {
  let component: BoardContentComponent;
  let fixture: ComponentFixture<BoardContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardContentComponent]
    });
    fixture = TestBed.createComponent(BoardContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
