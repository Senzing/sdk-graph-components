# @senzing/sdk-graph-components

[![Build Status](https://travis-ci.com/senzingiris/sdk-components-ng.svg?token=WxmiqA9RBhXENsrx41xE&branch=master)](https://travis-ci.com/senzingiris/sdk-components-ng)

## Overview

This project is for the Senzing&reg; Graph SDK components that can be used in other projects using Angular 7.X.X.
It is built off of the venerable D3 graphing framework.

### Installation

Open a terminal window to the location of your project and type:
`npm install @senzing/sdk-graph-components`

The components will be added to your node_modules.
You will then want to import the module in to your angular project.

```typescript
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
    SenzingSdkGraphModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Tags & Usage

For a full list of all available tags and parameters see the [Online Documentation](https://senzing.github.io/sdk-graph-components/).

```html
<sz-relationship-network></sz-relationship-network>
```

```html
<sz-relationship-network-input></sz-relationship-network-input>
```

```html
<sz-relationship-network-lookup></sz-relationship-network-lookup>
```

```html
<sz-relationship-network-upload></sz-relationship-network-upload>
```

```html
<sz-relationship-path></sz-relationship-path>
```

```html
<sz-relationship-network
  svgWidth=2000
  svgHeight=1000
  port=8080
  entityIds="1,1005"
  maxDegrees=3
  buildOut=2
  maxEntities=1000>
  </sz-relationship-network>
```

## Dependencies

For building from Source:

* [Node/NPM](https://nodejs.org/).
* [Angular CLI](https://cli.angular.io/)
* [TypeScript](https://www.typescriptlang.org/)

Please see the installation instructions for each of these for how to install and setup each one properly.

## Documentation

Full class and module documentation can be found [here](https://senzing.github.io/sdk-graph-components/).
