import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientHeadInfoComponent } from './recipient-head-info.component';

describe('RecipientHeadInfoComponent', () => {
  let component: RecipientHeadInfoComponent;
  let fixture: ComponentFixture<RecipientHeadInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipientHeadInfoComponent]
    });
    fixture = TestBed.createComponent(RecipientHeadInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
