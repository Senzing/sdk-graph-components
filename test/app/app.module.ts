import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SenzingSdkGraphComponentsModule} from '@senzing/sdk-graph-components';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SenzingSdkGraphComponentsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
