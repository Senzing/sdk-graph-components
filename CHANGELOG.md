# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
[markdownlint](https://dlaa.me/markdownlint/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2020-10-30

- API Client package updated to the [Senzing OAS 2.2.0](https://github.com/Senzing/senzing-rest-api-specification/releases/tag/2.2.0) specification.
- Bugfixes for enabling web component compatibility. See [#169](https://github.com/Senzing/sdk-components-ng/issues/169)
- Minor security updates. 

relevant tickets: #50, #46, [#169](https://github.com/Senzing/sdk-components-ng/issues/169)

## [2.1.1] - 2020-10-2

Bugfixes for node filtering, color application by datasource, tooltips, redraw and source race conditions.

relevant tickets: #27, #42

## [2.1.0] - 2020-9-21

Maintenence release for framework upgrade to Angular 10: see [https://blog.angular.io/version-10-of-angular-now-available-78960babd41](https://blog.angular.io/version-10-of-angular-now-available-78960babd41)

Major updates to most dependency versions have also been made which should improve file sizes, security, and stability.

The following Senzing projects have also been updated to operate on Angular 10,
see the following links for associated tickets:
- [sdk-components-ng/issues/143](https://github.com/Senzing/sdk-components-ng/issues/143)
- [rest-api-client-ng/issues/39](https://github.com/Senzing/rest-api-client-ng/issues/39)
- [sdk-graph-components/issues/37](https://github.com/Senzing/sdk-graph-components/issues/37)

## [0.1.1] - 2020-7-13
addresses issue #32

## [0.1.0] - 2019-11-11

addresses issues #18 #19 #21 #23 

- Added "loadedData" method for agnostic method parity
- Added filtering and color highlighting methods for SzRelationshipNetworkComponent 
- Added compatibility changes needed to support different graph frameworks agnosticaly.
- Various compatibility fixes

## [0.0.6] - 2019-9-8

addresses tickets: #6 #12 #14 #16 

- added SzGraphConfigurationService so that components had a way to change the graph api config through service methods. (same way sdk-components-ng handles it's config injection)
- graph can now reload when parameters change via a *reload* method
- added new lifecycle events: requestStarted, requestComplete, renderComplete
- added new behavior events: noResults,  loading, rendered
- add event emitters for: contextMenuClick, entityClick, entityDblClick

## [0.0.4] - 2019-8-3

minor release. addresses issues #7 #4 #2 
- graph node event emitters for binding to node hover, click, right click
- graph node overflow issue
- dynamically allow show/hide of link labels on "showLinkLabels" setter change

## [0.0.2] - 2019-7-17

fix for network graph nodes being pushed outside of bounding box.

## [0.0.1] - 2019-7-11

Initial release.

![2019-07-11_104342](https://user-images.githubusercontent.com/13721038/61072740-c7a86780-a3c8-11e9-8db8-fa81eb799e47.png)

- split the graph components out from the main SDK lib
- verified components work
- verified tests work
- added README, LICENSE, docs
- added all relevant tooling to generate npm packages from source
- added tooling to build docs from source
- added travis-ci configuration for automated tests