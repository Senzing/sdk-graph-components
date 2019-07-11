import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  ApiModule,
  Configuration as SzRestConfiguration
} from '@senzing/rest-api-client-ng';

/** models */
//import { SzEntityDetailSectionData } from './models/entity-detail-section-data';
//import { SzEntitySearchParams } from './models/entity-search';

/** services */
import { SzGraphTestService } from './services/graph-test.service';

/** components */
import { SzGraphTestComponent } from './graph-test/graph-test.component';
import { SzRelationshipNetworkComponent } from './graph/sz-relationship-network/sz-relationship-network.component';
import { SzRelationshipNetworkInputComponent } from './graph/sz-relationship-network-input/sz-relationship-network-input.component';
import { SzRelationshipNetworkLookupComponent } from './graph/sz-relationship-network-lookup/sz-relationship-network-lookup.component';
import { SzRelationshipNetworkUploadComponent } from './graph/sz-relationship-network-upload/sz-relationship-network-upload.component';
import { SzRelationshipPathComponent } from './graph/sz-relationship-path/sz-relationship-path.component';

/**
 * Sets up a default set of service parameters for use
 * by the SDK Components.
 *
 * this is only used when no configuration parameters are set
 * via the forRoot static method.
 * @internal
 */
export function SzDefaultRestConfigurationFactory(): SzRestConfiguration {
  return new SzRestConfiguration({
    basePath: 'http://localhost:8080',
    withCredentials: true
  });
}
/**
 * Injection Token for the rest configuration class
 * @internal
 */
// const SzRestConfigurationInjector = new InjectionToken<SzRestConfiguration>("SzRestConfiguration");


@NgModule({
  declarations: [
    SzGraphTestComponent,
    SzRelationshipNetworkComponent,
    SzRelationshipNetworkInputComponent,
    SzRelationshipNetworkLookupComponent,
    SzRelationshipNetworkUploadComponent,
    SzRelationshipPathComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ApiModule
  ],
  providers: [
    SzGraphTestService
  ],
  exports: [
    SzGraphTestComponent,
    SzRelationshipNetworkComponent,
    SzRelationshipNetworkInputComponent,
    SzRelationshipNetworkLookupComponent,
    SzRelationshipNetworkUploadComponent,
    SzRelationshipPathComponent
  ]
})
export class SenzingSdkGraphModule {
  public static forRoot(apiConfigFactory?: () => SzRestConfiguration): ModuleWithProviders {
    return {
        ngModule: SenzingSdkGraphModule,
        providers: [
          {
            provide: SzRestConfiguration,
            useFactory: apiConfigFactory ? apiConfigFactory : SzDefaultRestConfigurationFactory
          }
        ]
    };
  }
}
