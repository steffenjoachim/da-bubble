import { TestBed } from '@angular/core/testing';

import { SharedEmojiServiceService } from './shared-emoji.service.service';

describe('SharedEmojiServiceService', () => {
  let service: SharedEmojiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedEmojiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
