import { TestBed } from '@angular/core/testing';

import { SzGraphTestService } from './graph-test.service';

describe('SdkGraphComponentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SzGraphTestService = TestBed.get(SzGraphTestService);
    expect(service).toBeTruthy();
  });
});
