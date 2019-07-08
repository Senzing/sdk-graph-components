import { NgModule } from '@angular/core';
import { SzGraphTestComponent } from './graph-test/graph-test.component';
import { SzGraphTestService } from './services/graph-test.service';

@NgModule({
  declarations: [SzGraphTestComponent],
  imports: [],
  providers: [
    SzGraphTestService
  ],
  exports: [SzGraphTestComponent]
})
export class SenzingSdkGraphComponentsModule { }
