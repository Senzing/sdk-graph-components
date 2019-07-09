import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SenzingSdkGraphModule } from '@senzing/sdk-graph-components';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SenzingSdkGraphModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
