import { TestBed } from '@angular/core/testing';

import { FirestorageServiceService } from './firestorage-service.service';

describe('FirestorageServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirestorageServiceService = TestBed.get(FirestorageServiceService);
    expect(service).toBeTruthy();
  });
});
