import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardSidebarComponent } from './board-sidebar.component';

describe('BoardSidebarComponent', () => {
  let component: BoardSidebarComponent;
  let fixture: ComponentFixture<BoardSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardSidebarComponent]
    });
    fixture = TestBed.createComponent(BoardSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
