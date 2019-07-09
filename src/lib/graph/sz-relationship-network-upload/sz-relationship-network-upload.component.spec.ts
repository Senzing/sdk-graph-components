import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SzRelationshipNetworkUploadComponent } from './sz-relationship-network-upload.component';
import { SenzingSdkGraphModule } from 'src/lib/sdk-graph-components.module';

describe('SzRelationshipNetworkUploadComponent', () => {
  let component: SzRelationshipNetworkUploadComponent;
  let fixture: ComponentFixture<SzRelationshipNetworkUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SenzingSdkGraphModule.forRoot()]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SzRelationshipNetworkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
