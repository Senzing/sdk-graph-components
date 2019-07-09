'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Senzing SDK Graph Components</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/SzGraphTestComponent.html" data-type="entity-link">SzGraphTestComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SzRelationshipNetworkComponent.html" data-type="entity-link">SzRelationshipNetworkComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SzRelationshipNetworkInputComponent.html" data-type="entity-link">SzRelationshipNetworkInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SzRelationshipNetworkLookupComponent.html" data-type="entity-link">SzRelationshipNetworkLookupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SzRelationshipNetworkUploadComponent.html" data-type="entity-link">SzRelationshipNetworkUploadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SzRelationshipPathComponent.html" data-type="entity-link">SzRelationshipPathComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/SzGraphTestService.html" data-type="entity-link">SzGraphTestService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Graph.html" data-type="entity-link">Graph</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LinkInfo.html" data-type="entity-link">LinkInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeInfo.html" data-type="entity-link">NodeInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzEntityDetailSectionData.html" data-type="entity-link">SzEntityDetailSectionData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzEntityDetailSectionSummary.html" data-type="entity-link">SzEntityDetailSectionSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzEntitySearchParams.html" data-type="entity-link">SzEntitySearchParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzMatchFields.html" data-type="entity-link">SzMatchFields</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzNetworkGraphInputs.html" data-type="entity-link">SzNetworkGraphInputs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzRawData.html" data-type="entity-link">SzRawData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzRawDataMatches.html" data-type="entity-link">SzRawDataMatches</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SzSearchResultEntityData.html" data-type="entity-link">SzSearchResultEntityData</a>
                            </li>
                        </ul>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});