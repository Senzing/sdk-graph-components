import { Component, Input, Output, HostBinding, OnInit, ViewChild, AfterViewInit, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { Graph, NodeInfo, LinkInfo } from './graph-types';
import { Simulation } from 'd3-force';
import { EntityGraphService, SzEntityNetworkResponse, SzEntityNetworkData } from '@senzing/rest-api-client-ng';
import { SzNetworkGraphInputs } from '../../models/network-graph-inputs';
import { map, tap, first, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';

export interface TooltipEntityModel {
    label: string;
    id: number;
    orgName?: string;
    name?: string;
    gender?: string;
    address: string;
    phone: string;
    sources: string[];
}

export interface TooltipLinkModel {
  label: string;
  matchKey: string;
}

export interface NodeFilterPair {
  selectorFn: any;
  modifierFn?: any;
  selectorArgs?: any;
  modifierArgs?: any;
}

/**
 * Provides a SVG of a relationship network diagram via D3.
 * @export
 */
@Component({
  selector: 'sz-relationship-network',
  templateUrl: './sz-relationship-network.component.html',
  styleUrls: ['./sz-relationship-network.component.scss']
})
export class SzRelationshipNetworkComponent implements OnInit, AfterViewInit, OnDestroy {
  /** subscription to notify subscribers to unbind */
  public unsubscribe$ = new Subject<void>();

  static SOURCE_LINE_CHAR_LIMIT = 27;
  static MIN_RECORD_ID_LENGTH = 3;

  static readonly ICONS = {
    business: {
      shape: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
      enclosed: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
    }, // TODO replace the business .png with SVG
    userFemale: {
      // The outline of the face and shoulders for the female icon
      shape: "M687.543 599.771c-29.257 73.143-95.086 124.343-175.543 124.343s-146.286-51.2-175.543-117.029c-146.286 36.571-256 146.286-256 277.943v95.086h870.4v-95.086c0-138.971-117.029-248.686-263.314-285.257zM768 592.457c0 0-51.2-299.886-65.829-365.714-14.629-87.771-95.086-160.914-197.486-160.914-95.086 0-182.857 65.829-197.486 160.914-7.314 51.2-73.143 329.143-80.457 343.771 0 0 7.314 14.629 95.086-14.629 7.314 0 43.886-14.629 51.2-14.629 36.571 51.2 80.457 80.457 138.971 80.457 51.2 0 102.4-29.257 138.971-87.771 29.257 14.629 14.629 36.571 117.029 58.514zM512 599.771c-43.886 0-80.457-21.943-109.714-65.829v0c0 0-7.314-7.314-7.314-7.314s0 0 0 0-7.314-7.314-7.314-14.629c0 0 0 0 0 0 0-7.314-7.314-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314-7.314-7.314-7.314-14.629 0 0 0 0 0 0-7.314 0-7.314-7.314-7.314-7.314s0 0 0 0c0-7.314 0-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314 0-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314 0-7.314 0-14.629 0 0 0-7.314-7.314-7.314-7.314-7.314-14.629-21.943-14.629-43.886s7.314-43.886 14.629-51.2c0 0 7.314 0 7.314-7.314 14.629 14.629 7.314-7.314 7.314-21.943 0-43.886 0-51.2 0-58.514 29.257-21.943 80.457-51.2 117.029-51.2 0 0 0 0 0 0 43.886 0 51.2 14.629 73.143 36.571 14.629 29.257 43.886 51.2 109.714 51.2 0 0 0 0 7.314 0 0 0 0 14.629 0 29.257s0 43.886 7.314 14.629c0 0 0 0 7.314 7.314s14.629 21.943 14.629 51.2c0 21.943-7.314 36.571-21.943 43.886 0 0-7.314 7.314-7.314 7.314 0 7.314 0 7.314 0 14.629 0 0 0 0 0 0-7.314 7.314-7.314 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0s-0 7.314-0 7.314c0 0 0 0 0 0 0 7.314-7.314 7.314-7.314 14.629 0 0 0 0 0 0s-7.314 7.314-7.314 7.314v0c-29.257 43.886-73.143 65.829-109.714 65.829z",
      // The space enclosed by the face of the female icon
      enclosed: "M512 599.771c-43.886 0-80.457-21.943-109.714-65.829v0c0 0-7.314-7.314-7.314-7.314s0 0 0 0-7.314-7.314-7.314-14.629c0 0 0 0 0 0 0-7.314-7.314-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314-7.314-7.314-7.314-14.629 0 0 0 0 0 0-7.314 0-7.314-7.314-7.314-7.314s0 0 0 0c0-7.314 0-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314 0-7.314-7.314-14.629 0 0 0 0 0 0 0-7.314 0-7.314 0-14.629 0 0 0-7.314-7.314-7.314-7.314-7.314-14.629-21.943-14.629-43.886s7.314-43.886 14.629-51.2c0 0 7.314 0 7.314-7.314 14.629 14.629 7.314-7.314 7.314-21.943 0-43.886 0-51.2 0-58.514 29.257-21.943 80.457-51.2 117.029-51.2 0 0 0 0 0 0 43.886 0 51.2 14.629 73.143 36.571 14.629 29.257 43.886 51.2 109.714 51.2 0 0 0 0 7.314 0 0 0 0 14.629 0 29.257s0 43.886 7.314 14.629c0 0 0 0 7.314 7.314s14.629 21.943 14.629 51.2c0 21.943-7.314 36.571-21.943 43.886 0 0-7.314 7.314-7.314 7.314 0 7.314 0 7.314 0 14.629 0 0 0 0 0 0-7.314 7.314-7.314 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0 0 7.314 0 7.314-7.314 14.629 0 0 0 0 0 0s-0 7.314-0 7.314c0 0 0 0 0 0 0 7.314-7.314 7.314-7.314 14.629 0 0 0 0 0 0s-7.314 7.314-7.314 7.314v0c-29.257 43.886-73.143 65.829-109.714 65.829z"
    },
    userMale: {
      // The outline of the face and shoulders for the male icon
      shape: "M256 48C148.5 48 60.1 129.5 49.2 234.1c-.8 7.2-1.2 14.5-1.2 21.9 0 7.4.4 14.7 1.2 21.9C60.1 382.5 148.5 464 256 464c114.9 0 208-93.1 208-208S370.9 48 256 48zm135.8 326.1c-22.7-8.6-59.5-21.2-82.4-28-2.4-.7-2.7-.9-2.7-10.7 0-8.1 3.3-16.3 6.6-23.3 3.6-7.5 7.7-20.2 9.2-31.6 4.2-4.9 10-14.5 13.6-32.9 3.2-16.2 1.7-22.1-.4-27.6-.2-.6-.5-1.2-.6-1.7-.8-3.8.3-23.5 3.1-38.8 1.9-10.5-.5-32.8-14.9-51.3-9.1-11.7-26.6-26-58.5-28h-17.5c-31.4 2-48.8 16.3-58 28-14.5 18.5-16.9 40.8-15 51.3 2.8 15.3 3.9 35 3.1 38.8-.2.7-.4 1.2-.6 1.8-2.1 5.5-3.7 11.4-.4 27.6 3.7 18.4 9.4 28 13.6 32.9 1.5 11.4 5.7 24 9.2 31.6 2.6 5.5 3.8 13 3.8 23.6 0 9.9-.4 10-2.6 10.7-23.7 7-58.9 19.4-80 27.8C91.6 341.4 76 299.9 76 256c0-48.1 18.7-93.3 52.7-127.3S207.9 76 256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256c0 43.9-15.6 85.4-44.2 118.1z",
      // The space enclosed by the face of the male icon
      enclosed: "M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
    },
    // TODO introduce a gender-neutral person icon for when we can tell a node is a person but the gender isn't specified.
    default: {
      shape: "M256 48C148.5 48 60.1 129.5 49.2 234.1c-.8 7.2-1.2 14.5-1.2 21.9 0 7.4.4 14.7 1.2 21.9C60.1 382.5 148.5 464 256 464c114.9 0 208-93.1 208-208S370.9 48 256 48zm135.8 326.1c-22.7-8.6-59.5-21.2-82.4-28-2.4-.7-2.7-.9-2.7-10.7 0-8.1 3.3-16.3 6.6-23.3 3.6-7.5 7.7-20.2 9.2-31.6 4.2-4.9 10-14.5 13.6-32.9 3.2-16.2 1.7-22.1-.4-27.6-.2-.6-.5-1.2-.6-1.7-.8-3.8.3-23.5 3.1-38.8 1.9-10.5-.5-32.8-14.9-51.3-9.1-11.7-26.6-26-58.5-28h-17.5c-31.4 2-48.8 16.3-58 28-14.5 18.5-16.9 40.8-15 51.3 2.8 15.3 3.9 35 3.1 38.8-.2.7-.4 1.2-.6 1.8-2.1 5.5-3.7 11.4-.4 27.6 3.7 18.4 9.4 28 13.6 32.9 1.5 11.4 5.7 24 9.2 31.6 2.6 5.5 3.8 13 3.8 23.6 0 9.9-.4 10-2.6 10.7-23.7 7-58.9 19.4-80 27.8C91.6 341.4 76 299.9 76 256c0-48.1 18.7-93.3 52.7-127.3S207.9 76 256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256c0 43.9-15.6 85.4-44.2 118.1z",
      enclosed: "M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
    }
  };
  public entityId;
  chart: any;
  /** whethor or not to show the tooltip */
  tooltipShowing = false;
  graphData: any;
  /** tooltip data for entity hover */
  public toolTipEntData: TooltipEntityModel;
  /** tooltip daata for entity relationship links */
  public toolTipLinkData: TooltipLinkModel;
  /** data used to populate tooltip template, switched ref to either "toolTipEntData" or "toolTipLinkData" */
  public toolTipData: TooltipEntityModel | TooltipLinkModel;
  /** position of tooltip left relative to graph canvas */
  public toolTipPosLeft = 0;
  /** position of tooltip top relative to graph canvas */
  public toolTipPosTop = 0;

  private _loading = false;
  @Output() public get loading(): boolean {
    return this._loading;
  }
  private _rendered = false;
  @Output() public get rendered(): boolean {
    return this._rendered;
  }

  /** @internal */
  private _requestStarted: Subject<boolean> = new Subject<boolean>();
  /** @internal */
  private _requestComplete: Subject<boolean> = new Subject<boolean>();
  /** @internal */
  private _renderComplete: Subject<boolean> = new Subject<boolean>();
  /** @internal */
  private _requestNoResults: Subject<boolean> = new Subject<boolean>();

  /**
   * Observeable stream for the event that occurs when a network
   * request is initiated
   */
  public requestStarted: Observable<boolean>;
  /**
   * Observeable stream for the event that occurs when a network
   * request is completed
   */
  public requestComplete: Observable<boolean>;
  /**
   * Observeable stream for the event that occurs when a draw
   * operation is completed
   */
  public renderComplete: Observable<boolean>;
  /**
   * Observeable stream for the event that occurs when a
   * request completed but has no results
   */
  public requestNoResults: Observable<boolean>;
  /**
   * emitted when the player right clicks a entity node.
   * @returns object with various entity and ui properties.
   */
  @Output() noResults: EventEmitter<boolean> = new EventEmitter<boolean>();


  // assigned during render phase to D3 selector groups
  private svg: any;
  private linkGroup: any;

  // --- used for compatibility sensing
  public isKeyLines = false;
  public isD3 = true;

  /** svg element */
  @ViewChild('graphEle') svgComponent;
  public svgElement: SVGElement;
  /** tooltip container element */
  @ViewChild('tooltipContainer')
  public tooltipContainer: ElementRef;
  /** tooltip entity template */
  @ViewChild('ttEnt') tooltipEntTemplate;
  /** relationship link tooltip template */
  @ViewChild('ttLink') tooltipLinkTemplate;
  /** tooltip template switchable ref */
  public toolTipTemplate = this.tooltipEntTemplate;
  /** tooltip element, child element of container with absolute pos  */
  @ViewChild('tooltip') tooltip: ElementRef;

  private _showLinkLabels: boolean = false;
  @Input() public set showLinkLabels(value: boolean) {
    this._showLinkLabels = value;
    if(value && this.linkLabel) {
      this.linkLabel.style("opacity", 1);
      // console.log('@senzing/sdk-graph-components:sz-relationship-network.setShowLinkLabels: ', value, 1);
    } else if(this.linkLabel) {
      this.linkLabel.style("opacity", 0);
      // console.log('@senzing/sdk-graph-components:sz-relationship-network.setShowLinkLabels: ', value, 0);
    } else {
      // console.log('@senzing/sdk-graph-components:sz-relationship-network.setShowLinkLabels: UNKNOWN!', this._showLinkLabels, this.linkLabel);
    }
  }
  public get showLinkLabels(): boolean {
    return this._showLinkLabels;
  }

  private _loadedData: SzNetworkGraphInputs;
  @Input() public set loadedData(value: SzNetworkGraphInputs) {
    if (value === undefined || value === null) {
      console.log("Undefined set value");
      return;
    }
    //this.render(value);
  }

  /** emit "onDataLoaded" when data received and parsed */
  @Output() public onDataLoaded: EventEmitter<SzNetworkGraphInputs> = new EventEmitter<SzNetworkGraphInputs>();

  /**
   * arbitrary value just for drawing
   * @internal
   */
  private _statWidth: number = 800;
  /**
   * sets the width of the component
   */
  @HostBinding('style.width.px')@Input() svgWidth;

  /**
   * arbitrary value just for drawing
   * @internal
   */
  private _statHeight: number = 400;
  /**
   * sets the height attribute of the svg.
   * @deprecated svg is always 100% of parent dom elements height
   */
  @HostBinding('style.height.px')@Input() svgHeight: string;

  /**
   * this matches up with the "_statWidth" and "_statHeight" to
   * content centering and dynamic scaling properties.
   * @internal
  */
  private _svgViewBox: string = '150 50 400 300';
  /**
   * sets the viewBox attribute on the svg element.
  */
  @Input() public set svgViewBox(value: string) { this._svgViewBox = value; }
  /**
   * gets the viewBox attribute on the svg element.
   */
  public get svgViewBox() { return this._svgViewBox; }

  /**
   * the preserveAspectRatio attribute on the svg element.
   * @interal
   */
  private _preserveAspectRatio: string = "xMidYMid meet";
   /**
   * sets the preserveAspectRatio attribute on the svg element.
   * used to set aspect ratio, centering etc for dynamic scaling.
   */
  @Input() public set svgPreserveAspectRatio(value: string) { this._preserveAspectRatio = value; }
  /**
   * gets the preserveAspectRatio attribute on the svg element.
   */
  public get svgPreserveAspectRatio() { return this._preserveAspectRatio; }

  private _fixDraggedNodes: boolean = true;
  /**
   * sets whether or not to fix nodes in place after dragging.
   */
  @Input() public set fixDraggedNodes(value: boolean) { this._fixDraggedNodes = value; }

  /** @internal */
  private _entityIds: string[];

  /**
   * Set the entityIds of the src entities to do discovery search around.
   */
  @Input() set entityIds(value: string | number | number[]) {
    let _changed = false;
    if(value && typeof value === 'string') {
      if(value && value.indexOf(',')) {
        // string array
        _changed = this._entityIds != value.split(',');
        this._entityIds = value.split(',');
      } else {
        // single string
        _changed = this._entityIds != [value];
        this._entityIds = [value];
      }
    } else if(value && typeof value === 'number') {
      // single number
      _changed = this._entityIds != [ value.toString() ];
      this._entityIds = [ value.toString() ];
    } else if(value) {
      // the only other thing it could be is number[]
      _changed = this._entityIds != value.toString().split(',');
      this._entityIds = value.toString().split(',');
    }
    // console.log('sdk-graph-components/sz-relationship-network.component: entityIds setter( '+_changed+' )', this._entityIds);
  }

  /**
   * amount of degrees of separation to populate the graph with
   */
  private _maxDegrees: number;
  @Input() set maxDegrees(value: string | number) {
    this._maxDegrees = +value;
  }
  private _buildOut: number;
  @Input() set buildOut(value: string| number) { this._buildOut = +value; }

  /**
   * maxiumum entities to display
   */
  private _maxEntities: number;
  @Input() set maxEntities(value: string | number) { this._maxEntities = +value; }

  /**
   * the space between nodes
   */
  private _linkGravity = 8;
  @Input() public set linkGravity(value: number) { this._linkGravity = value; }

  /**
   * name label padding
   */
  private _labelPadding = 8;
  @Input() public set labelPadding(value: number) { this._labelPadding = value; }

  /**
   * return the raw data node in the payload
   */
  static readonly WITH_RAW: boolean = true;

  /**
   * nulls out the browser right click menu
   * @param event
   */
  public onRightClick(event: any) {
    return false;
  }

  /**
   * emitted when the player right clicks a entity node.
   * @returns object with various entity and ui properties.
   */
  @Output() contextMenuClick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * emitted when the player clicks a entity node.
   * @returns object with various entity and ui properties.
   */
  @Output() entityClick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * emitted when the user dbl-clicks a entity node.
   * @returns object with various entity and ui properties.
   */
  @Output() entityDblClick: EventEmitter<any> = new EventEmitter<any>();

  /**
   * filtering to apply to graph response collection.
   * only settable through "filter" setter
   */
  private _filterFn: NodeFilterPair[];
  /**
   * apply effect to nodes and link nodes that match any members that match
   * any of the "selectorFn" properties in fnPairArray
   * @param fnPairArray
   */
  private _applyFilterFn(fnPairArray: NodeFilterPair[]) {
    const _excludedIds = [];
    if (fnPairArray && fnPairArray.length >= 0) {
      if(this.chart && this.chart.filter) {
        // --- start keylines filter
        fnPairArray.forEach( (pairFn, _index) => {
          // keylines filter actually does the filtering
          // no need to change opacity etc
          /** selectorFn functions look like:
           * function myFilter(item) {
           *   return (item.d.dataSources.indexOf('DATASOURCE 1') > -1);
           * }
           */
          this.chart.filter(pairFn.selectorFn, { type: 'node' }).then( ( filterResults )=> {
            // console.log('performed keylines filter: ', filterResults);
          });
        });
        // --- end keylines filter
      } else if( this.node && this.node.filter) {
        // --- start D3 filter
        fnPairArray.forEach( (pairFn) => {
          const _filtered = this.node.filter( pairFn.selectorFn );
          // create array of filtered entityIds to compare source/target links to
          _filtered.each( (fNode) => {
            //console.log('what the? ', fNode);
            _excludedIds.push( fNode.entityId );
          });
          if ( _filtered && pairFn && pairFn.modifierFn && pairFn.modifierFn.call) {
            // first change opacity on ALL items
            _filtered.style('opacity', 0);
            // now apply special filter highlighter
            pairFn.modifierFn(_filtered);
            const _nodePaths = _filtered.select('path');
            if ( _nodePaths ) {
              pairFn.modifierFn(_nodePaths);
            }
          } else if (_filtered && pairFn && !pairFn.modifierFn) {
            _filtered.style('opacity', 0);
          }
        });

        // hide any related "link" nodes using "_excludedIds" members
        // generated from filtering function
        if(_excludedIds && this.link && this.link.filter ) {
          const _linksToHide = this.link.filter( (lNode) => {
            return (_excludedIds.indexOf( lNode.source.entityId ) >= 0 || _excludedIds.indexOf( lNode.target.entityId ) >= 0);
          });
          if(_linksToHide && _linksToHide.style) {
            try {
              _linksToHide.style('opacity', 0);
            } catch(err) {}
          }
        }
        // hide any related match keys
        //console.warn('filter match keys? ', _excludedIds, this.linkLabel);
        if(_excludedIds && this.link && this.linkLabel.filter ) {
          const _linksToHide = this.linkLabel.filter( (lNode) => {
            return (_excludedIds.indexOf( lNode.source.entityId ) >= 0 || _excludedIds.indexOf( lNode.target.entityId ) >= 0);
          });
          if(_linksToHide && _linksToHide.style) {
            try {
              _linksToHide.style('opacity', 0);
            } catch(err) {}
          }
        }
        // --- end D3 filter
      }
    }

  }
  /**
   * apply effect or styles to nodes that match any of the "selectorFn" functions in fnPairArray
   * @param fnPairArray
   */
  private _applyModifierFn(fnPairArray: NodeFilterPair[]) {

    if (fnPairArray && fnPairArray.length >= 0) {
      if(this.chart && this.chart.each) {
        // Keylines
        const _nodes = [];
        // first convert chart nodes in to an array
        this.chart.each({ type: 'node' }, (node) => {
          _nodes.push(node);
        });
        // now filter array by selectorFns
        fnPairArray.forEach( (pairFn) => {
          const _filtered = _nodes.filter( pairFn.selectorFn );
          if(_filtered && pairFn && pairFn.modifierFn && pairFn.modifierFn.call) {
            pairFn.modifierFn(_filtered, this.chart);
          }
        });
      } else if( this.node && this.node.filter) {
        // D3
        fnPairArray.forEach( (pairFn) => {
          const _filtered = this.node.filter( pairFn.selectorFn );
          if(_filtered && pairFn && pairFn.modifierFn && pairFn.modifierFn.call) {
            pairFn.modifierFn(_filtered);
            const _nodePaths = _filtered.select('path');
            if ( _nodePaths ) {
              pairFn.modifierFn(_nodePaths);
            }
          }
        });
      }
    }
  }
  /**
   * add or modify data to nodes that match any of the "selectorFn" functions in fnPairArray
   * @param fnPairArray
   */
  private _applyDataFn(fnPairArray: NodeFilterPair[]) {
    if (fnPairArray && fnPairArray.length >= 0) {
      if(this.chart && this.chart.each) {
        // TODO: implement in KL way
      } else if( this.node && this.node.filter) {
        fnPairArray.forEach( (pairFn) => {
          const _filtered = this.node.filter( pairFn.selectorFn );
          if(_filtered && pairFn && pairFn.modifierFn && pairFn.modifierFn.call) {
            _filtered.datum( pairFn.modifierFn );
            //pairFn.modifierFn(_filtered);
          }
        });
      }
    }
  }
  /**
   * set the filters to apply to the display of nodes in graph. The default is to hide any
   * nodes that return true when the selectorFn is called on the node.
   */
  @Input() public set filter(fn: NodeFilterPair[] | NodeFilterPair) {
    if((fn as NodeFilterPair).selectorFn) {
      // is single pair, save as single item array
      fn = [ (fn as NodeFilterPair) ];
    }
    const oldValueAsJSON = JSON.stringify(this._filterFn);
    this._filterFn = fn as NodeFilterPair[];
    if(oldValueAsJSON != JSON.stringify(this._filterFn)) {
      //console.warn('SzRelationshipNetworkComponent.filter = ', JSON.stringify(this._filterFn));
      this._applyFilterFn(this._filterFn);
    }
  }
  /**
   * get the filters that are being applied to nodes.
   */
  public get filter(): NodeFilterPair[] | NodeFilterPair {
    return this._filterFn;
  }
  /** only settable through "highlight" setter */
  private _highlightFn: NodeFilterPair[];
  /**
   * set a style or effect to apply to the display of nodes in graph that match any
   * of the criteria set by "".
   * @example
   * SzRelationshipNetworkComponent.highlight = {selectorFn: (node) => { return node.dataSources.indexOf('MY DATASOURCE') > -1; }, modifierFn: (nodeList) => { nodeList.style('fill','orange'); }}
   */
  @Input() public set highlight(fn: NodeFilterPair[] | NodeFilterPair) {
    if((fn as NodeFilterPair).selectorFn) {
      // is single pair, save as single item array
      fn = [ (fn as NodeFilterPair) ];
    }
    const oldValueAsJSON = JSON.stringify(this._highlightFn);
    this._highlightFn = fn as NodeFilterPair[];
    if(oldValueAsJSON != JSON.stringify(this._highlightFn)) {
      this._applyModifierFn(this._highlightFn);
    }
  }
  /** only settable through "modify" setter */
  private _modifyFn: NodeFilterPair[];
  /**
   * set or update a property on nodes in graph that match any
   * of the criteria set by "".
   * @example
   * SzRelationshipNetworkComponent.modify = {selectorFn: (node) => { return node.dataSources.indexOf('MY DATASOURCE') > -1; }, modifierFn: (data) => { data.newProperty = true; return data; } }
   */
  @Input() public set modify(fn: NodeFilterPair[] | NodeFilterPair) {
    if((fn as NodeFilterPair).selectorFn) {
      // is single pair, save as single item array
      fn = [ (fn as NodeFilterPair) ];
    }
    const oldValueAsJSON = JSON.stringify(this._modifyFn);
    this._modifyFn = fn as NodeFilterPair[];
    if(oldValueAsJSON != JSON.stringify(this._modifyFn)) {
      this._applyDataFn(this._modifyFn);
    }
  }

  /**  the node or main selection */
  public get chartNodes() {
    return this.node;
  }
  /** the data for the nodes in this.chartNodes */
  public get chartData() {
    if(this.node && this.node.data) {
      return this.node.data();
    } else {
      return undefined;
    }
  }

  /** main D3 selection entity nodes */
  node;
  /** text names that appear under entity nodes */
  nodeLabel;
  /** main D3 selection for relationship lines */
  link;
  linkLabel;
  forceSimulation: Simulation<NodeInfo, LinkInfo>;
  linkedByNodeIndexMap;

  constructor(
    private graphService: EntityGraphService
  ) {
    this.linkedByNodeIndexMap = {};
    // set up public observable streams
    this.requestStarted = this._requestStarted.asObservable();
    this.requestComplete = this._requestComplete.asObservable();
    this.renderComplete = this._renderComplete.asObservable();
    this.requestNoResults = this._requestNoResults.asObservable();
  }

  ngOnInit() {
    // get dom element reference to svg tag
    this.svgElement = (this.svgComponent.nativeElement as SVGSVGElement);

    if (this._entityIds === undefined || this._entityIds.length === 0) {
      console.log("No EntityIDs passed in to " + this);
      return;
    }
  }

  /** make network request and populate svg */
  ngAfterViewInit() {
    if(this._entityIds) {
      this.getNetwork().pipe(
        takeUntil(this.unsubscribe$),
        first(),
        map( this.asGraphInputs.bind(this) ),
        tap( (gdata: SzNetworkGraphInputs) => {
          // console.log('SzRelationshipNetworkGraph: g1 = ', gdata);
          if(gdata && gdata.data && gdata.data.entities && gdata.data.entities.length == 0) {
            this.noResults.emit(true);
            this._requestNoResults.next(true);
          }
          this.onDataLoaded.emit(gdata);
        })
      ).subscribe( this.render.bind(this) );
    }
  }

  /**
   * unsubscribe when component is destroyed
   */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * make graph network request using input parameters
   */
  private getNetwork() {
    if(this._entityIds) {
      return this.graphService.findNetworkByEntityID(
        this._entityIds,
        this._maxDegrees,
        this._buildOut,
        this._maxEntities,
        SzRelationshipNetworkComponent.WITH_RAW );
    } else {
      throw new Error('entity ids are required to make "findNetworkByEntityID" call.');
    }
  }

  /** main render lifecycle method */
  public render(gdata: SzNetworkGraphInputs) {
    console.log('@senzing/sdk-graph-components/sz-relationship-network.render(): ', gdata, this._filterFn);
    this.loadedData = gdata;
    this.addSvg(gdata);
    // publish out event
    this._renderComplete.next(true);
    // if we have filters apply them
    if( this._filterFn && this._filterFn.length > 0) {
      this._applyFilterFn(this._filterFn);
    }
    // if we have modifiers apply them
    if( this._modifyFn && this._modifyFn.length > 0) {
      this._applyDataFn(this._modifyFn);
    }
    // if we have highlighters apply them
    if( this._highlightFn && this._highlightFn.length > 0) {
      this._applyModifierFn(this._highlightFn);
    }
  }

  /** re-render if already loaded */
  public reload(): void {
    //console.warn('@senzing/sdk-graph-components/sz-relationship-network.reload(): ', this._entityIds);
    if(this.svg && this.svg.selectAll) {
      this.svg.selectAll('*').remove();
    }

    if(this._entityIds) {
      this._requestStarted.next(true);
      this.getNetwork().pipe(
        takeUntil(this.unsubscribe$),
        first(),
        map( this.asGraphInputs.bind(this) ),
        tap( (gdata: SzNetworkGraphInputs) => {
          //console.log('SzRelationshipNetworkGraph: g1 = ', gdata);
          if(gdata && gdata.data && gdata.data.entities && gdata.data.entities.length == 0) {
            this.noResults.emit(true);
            this._requestNoResults.next(true);
          }
          this._requestComplete.next(true);
          this.onDataLoaded.emit(gdata);
        })
      ).subscribe( this.render.bind(this) );
    }
  }
  /** take the result from getNetwork and transpose to SzNetworkGraphInputs class  */
  asGraphInputs(graphResponse: SzEntityNetworkResponse) : SzNetworkGraphInputs {
    const _showLinkLabels = this.showLinkLabels;
    return new class implements SzNetworkGraphInputs {
      data = graphResponse.data; // SzEntityNetworkData
      showLinkLabels = _showLinkLabels;
    };
  }

  /** render svg elements from graph data */
  addSvg(gdata: SzNetworkGraphInputs, parentSelection = d3.select("body")) {
    const graph = this.asGraph( gdata );
    const tooltip = parentSelection
      .append("div")
      .attr("class", "sz-graph-tooltip")
      .style("opacity", 0);

    // Add the SVG to the HTML body
    this.svg = d3.select( this.svgElement );
    // console.log('@senzing/sdk-graph-components:sz-relationship-network.addSvg', this.svg, this.svgElement, gdata, graph);

    /*
     * If you're unfamiliar with selectors acting like a join (starting in d3.v4), here's where things may be confusing.
     *   selectAll(...)                   selects all elements in the DOM (that match the selector's value).
     *   selectAll(...).data(...)         selects the intersection of items both in the DOM and in data.
     *   selectAll(...).data(...).enter() selects new items that are in data but not yet in the DOM.  Usually followed by append(...).
     *   selectAll(...).data(...).exit()  selects old items that are in the DOM but no longer in data.  Usually followed by remove().
     *
     * A lot of D3 examples are v3, where selectAll(...).data(...) selected existing items AND new items.  In v4+ if you
     *   want to select both new and existing elements, you call existingItems.merge(newItems).  I don't do that in this
     *   code, but there's an excellent example at https://bl.ocks.org/mbostock/3808218.
     */

    // Add link groups (line + label)
    this.linkGroup = this.svg.selectAll('.sz-graph-link')
      .data(graph.links)
      .enter();

    // Add the lines, except we're not defining how they're drawn here.  That happens in tick()
    this.link = this.linkGroup.append('path')
      .attr('class', d => d.isCoreLink ? 'sz-graph-core-ink' : 'sz-graph-link')
      .attr('id', d => d.id); // This lets SVG know which label goes with which line

    // Add link labels
    this.linkLabel = this.linkGroup.append('svg:text')
      .attr('text-anchor', 'middle')
      .attr('class', 'sz-graph-link-label')
      .attr('dy', -3)
      .append('textPath')
      .attr('class', d => d.isCoreLink ? 'sz-graph-core-link-text' : 'sz-graph-link-text')
      .attr('startOffset', '50%')
      .attr('xlink:href', d => '#' + d.id) // This lets SVG know which label goes with which line
      .text(d => d.matchKey);

    // show or hide link labels based on input state
    if(!this.showLinkLabels) {
      this.linkLabel.style("opacity", 0);
    }

    // Add Nodes.  Adding the nodes after the links is important, because svg doesn't have a z axis.  Later elements are
    //   drawn on top of earlier elements.
    this.node = this.svg.selectAll('.sz-graph-node')
      .data(graph.nodes)
      .enter().append('g')
      .attr('class', 'sz-graph-node');

    // Add node labels
    this.nodeLabel = this.node.append("svg:text")
    .attr("text-anchor", "middle")
    .attr("dy", ".25em")
    .attr("y", 25)
    .attr("class", "sz-graph-label")
    .text(d => {
      return d && d.name && d.name.length > 18 ? d.name.substring(0, 15).trim() + "..." : d.name;
    });

    // Adds a background underneath the node labels.  This label is mostly opaque so that the label is still legible in
    //   busy areas of a network.
    const nodeLabelBBoxAry = [];
    this.nodeLabel.each(function (d, i) {
      nodeLabelBBoxAry[i] = this.getBBox();
    });

    // Text background
    this.node.insert('svg:rect', 'text')
      .attr('x', (d, i) => nodeLabelBBoxAry[i].x - (this._labelPadding / 2))
      .attr('y', (d, i) => nodeLabelBBoxAry[i].y - (this._labelPadding / 2))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', (d, i) => nodeLabelBBoxAry[i].width + this._labelPadding)
      .attr('height', (d, i) => nodeLabelBBoxAry[i].height + this._labelPadding)
      .attr('class', "sz-graph-bbox");

    // Add an SVG circle for the person's face.  This hides the links so they're not visible through the face.
    this.node.filter(d => d.iconType !== "business" && SzRelationshipNetworkComponent.ICONS[d.iconType])
      //.append('path')
      .append('circle')
      .attr('class', function(d) {
        return ['sz-graph-icon-enclosure'].concat(d.relationTypeClasses).join(' ');
      })
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 15);

      //.attr('d', d => SzRelationshipNetworkComponent.ICONS[d.iconType]["enclosed"])
      //.attr("transform", "translate(-20,-20) scale(.080)");

    // Add an SVG icon for the person.
    this.node.filter(d => d.iconType !== "business")
      .append('path')
      .attr('class', function(d) {
        return ['sz-graph-node-icon'].concat(d.relationTypeClasses).join(' ');
      })
      .attr('fill', d => d.isQueriedNode ? "#000000" : d.isCoreNode ? '#999999' : '#DDDDDD')
      .attr("d", d => SzRelationshipNetworkComponent.ICONS[d.iconType] ?
                      SzRelationshipNetworkComponent.ICONS[d.iconType]["shape"] :
                      SzRelationshipNetworkComponent.ICONS["default"]["shape"])
      .attr("transform", "translate(-20,-20) scale(.080)");

    // add svg mask for business so you cant click through the surface
    // two rectangles that fill in the building path
    this.node.filter(d => d.iconType === "business")
      .append('rect')
      .attr('x', 2.03)
      .attr('y', 3.048)
      .attr('width', 9.898)
      .attr('height', 17.939)
      .attr('class', 'sz-graph-business-icon-enclosure')
      .attr("transform", "translate(-20,-20) scale(1.4)");
    this.node.filter(d => d.iconType === "business")
      .append('rect')
      .attr('x', 11.966)
      .attr('y', 7.068)
      .attr('width', 9.974)
      .attr('height', 13.918)
      .attr('class', 'sz-graph-business-icon-enclosure')
      .attr("transform", "translate(-20,-20) scale(1.4)");

    // Add svg icon for business (corps are not people)
    this.node.filter(d => d.iconType === "business")
    .append('path')
    .attr('class', function(d) {
      return ['sz-graph-node-icon'].concat(d.relationTypeClasses).join(' ');
    })
    .attr('fill', d => d.isQueriedNode ? "#000000" : d.isCoreNode ? '#999999' : '#DDDDDD')
    .attr("d", d => SzRelationshipNetworkComponent.ICONS[d.iconType] ?
                    SzRelationshipNetworkComponent.ICONS[d.iconType]["shape"] :
                    SzRelationshipNetworkComponent.ICONS["default"]["shape"])
    .attr("transform", "translate(-20,-20) scale(1.4)");

    this.node.each(d => {
      d.x = this._statWidth / 2;
      d.y = this._statHeight / 2;
    });

    // if there are any special node modifier functions run them
    if( this._highlightFn || this._filterFn || this._modifyFn) {
      // run a fn against the node list
      if (this._filterFn && this._filterFn.length > 0) {
        this._applyFilterFn(this._filterFn);
      } else if(this._modifyFn && this._modifyFn.length > 0) {
        this._applyModifierFn(this._modifyFn);
      } else if (this._highlightFn && this._highlightFn.length > 0) {
        this._applyModifierFn(this._filterFn);
      }
    }

    // Add icons for businesses
    this.node.filter(d => d.iconType === "business")
      .attr("xlink:href", d => {
        const nodeType = d.isQueriedNode ? 'queried' : d.isCoreNode ? 'core' : 'buildout';
        return "../img/icons8-building-50-" + nodeType + ".png";
      })
      .attr("x", -20)
      .attr("y", -20)
      .attr("height", 50)
      .attr("width", 50)
      .attr('class', "sz-graph-icon " + (d => d.isQueriedNode ? 'sz-graph-queried-node' : d.isCoreNode ? 'sz-graph-core-node' : 'sz-graph-node'));

    // Define the simulation with nodes, forces, and event listeners.


    this.forceSimulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink().links(graph.links).distance(this._statWidth / this._linkGravity)) // links pull nodes together
      .force('charge', d3.forceManyBody().strength(-30)) // nodes repel each other
      .force('x', d3.forceX(this._statWidth / 2).strength(0.05)) // x and y continually pull all nodes toward a point.  If the
      .force('y', d3.forceY(this._statHeight / 2).strength(0.05)) //  graph has multiple networks, this keeps them on screen
      .on('tick', this.tick.bind(this));

    // Make the tooltip visible when mousing over nodes.  Fade out distant nodes
    this.node.on('mouseover.tooltip', function (d) {
      tooltip.transition()
        .duration(300)
        .style("opacity", .8);
      tooltip.html(SzRelationshipNetworkComponent.nodeTooltipText(d))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    })
    .on('mouseover.fade', this.fade(0.1).bind(this))
    .on("mouseout.tooltip", function () {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0);
    })
    .on('mouseout.fade', this.fade(1).bind(this))
    .on("mousemove", function () {
      tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    })
    .on('click', this.onNodeClick.bind(this))
    .on('dblclick', this.onNodeDblClick.bind(this))
    .on('contextmenu', this.onNodeContextClick.bind(this));

    // Make the tooltip visible when mousing over links.  Fade out distant nodes
    this.link.on('mouseover.fade', this.linkFade(0.1).bind(this))
      .on('mouseover.tooltip', function (d) {
        tooltip.transition()
          .duration(300)
          .style("opacity", .8);
        tooltip.html(SzRelationshipNetworkComponent.linkTooltipText(d))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      })
      .on("mouseout.tooltip", function () {
        tooltip.transition()
          .duration(100)
          .style("opacity", 0);
      })
      .on('mouseout.fade', this.linkFade(1).bind(this))
      .on("mousemove", function () {
        tooltip.style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      });

    graph.links.forEach( this.registerLink.bind(this) );
    // publish out event
    this._rendered = true;
  }

  private registerLink(d: LinkInfo) {
    const source : NodeInfo = <NodeInfo> d.source;
    const target : NodeInfo = <NodeInfo> d.target;
    this.linkedByNodeIndexMap[`${source.index},${target.index}`] = 1;
  }

  static linkTooltipText(d) {
    return "<strong>From</strong>: " + d.source.name +
      "<br/><strong>To</strong>: " + d.target.name +
      "<br/><strong>Match Level</strong>: " + d.matchLevel +
      "<br/><strong>Match Key</strong>: " + d.matchKey;
  }

  static nodeTooltipText(d) {
    return "<strong>Entity ID</strong>: " + d.entityId +
      "<br/><strong>Name</strong>: " + d.name +
      "<br/><strong>Address</strong>: " + d.address +
      "<br/><strong>Phone</strong>: " + d.phone;
  }

  isConnected(a, b) {
    return this.linkedByNodeIndexMap[`${a.index},${b.index}`] ||
      this.linkedByNodeIndexMap[`${b.index},${a.index}`] ||
      a.index === b.index;
  }

  /**
   * handler for when a entity node is clicked.
   * proxies to synthetic event "entityClick"
   * @param event
   */
  onNodeClick(event: any) {
    this.entityClick.emit(event);
  }
  /**
   * handler for when a entity node is double clicked.
   * proxies to synthetic event "entityDblClick"
   * @param event
   */
  onNodeDblClick(event: any) {
    this.entityDblClick.emit(event);
    return false;
  }
  /**
   * handler for when a entity node is right clicked.
   * proxies to synthetic event "contextMenuClick"
   * @param event
   */
  onNodeContextClick(event: any) {
    this.contextMenuClick.emit(event);
    return false;
  }

  /**
   * function that is executed on node hover
   * @param opacity
   */
  fade(opacity) {
    const isConnectedLocal = this.isConnected.bind(this);
    return d => {
      this.node.transition().duration(100).style('opacity', function (o) {
        const thisOpacity = isConnectedLocal(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      this.link.transition().duration(100).style('opacity', o => (o.source === d || o.target === d ? 1 : opacity));
      if (this.showLinkLabels) {
        this.linkLabel.transition().duration(100).style('opacity', o => (o.source === d || o.target === d ? 1 : opacity));
      }
    };
  }
  /**
   * Fade Rules for hovering over links
   * As currently implemented, any nodes that are connected to both source and target are not faded out.
   */
  linkFade(opacity) {
    const isConnectedLocal = this.isConnected.bind(this);
    return d => {
      this.node.transition().duration(100).style('opacity', function (o) {
        const thisOpacity = isConnectedLocal(d.source, o) &&
                            isConnectedLocal(d.target, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      this.link.transition().duration(100).style('opacity', o => (o.source === d.source && o.target === d.target ? 1 : opacity));
      if (this.showLinkLabels) {
        this.linkLabel.transition().duration(100).style('opacity', opacity);
      }
    };
  }

  /**
   * Update the SVG to show changes in node position caused by either the user or D3's forces
   * Not called when D3's forces reach equilibrium
   */
  tick() {
    // Update the SVG for each .node
    this.node.attr("transform", d => "translate(" + d.x + "," + d.y + ")")
      .call(d3.drag()             // TODO Update dragging code to use v5 conventions for event listening
        .on("start", this.dragstarted.bind(this))
        .on("drag", this.dragged.bind(this))
        .on("end", this.dragended.bind(this)));

    // Update link SVG
    // Draws left to right so .link-label stay right-side up
    this.link.attr('d', d => (d.source.x < d.target.x) ?
      SzRelationshipNetworkComponent.linkSvg(d.source, d.target) :
      SzRelationshipNetworkComponent.linkSvg(d.target, d.source));

    // Show or hide .link-label
    if (this.showLinkLabels) {
      d3.selectAll('.link-label').attr('opacity', 100);
    } else {
      d3.selectAll('.link-label').attr('opacity', 0);
    }
  }

  /**
   * Generate SVG commands for a straight line between two nodes, always left-to-right.
   */
  static linkSvg(leftNode, rightNode) {
    return 'M' + leftNode.x + ',' + leftNode.y + 'L' + rightNode.x + ',' + rightNode.y;
  }

  /**
   * When the user clicks and drags and node, 'Re-heat' the simulation if nodes have stopped moving.
   *   To oversimplify, alpha is the rate at which the simulation advances.
   *   alpha approaches alphaTarget at a rate of alphaDecay.
   *   The simulation stops once alpha < alphaMin.
   *   Restart sets alpha back to 1.
   */
  dragstarted() {
    if (!d3.event.active && this.forceSimulation) this.forceSimulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  /**
   * Update the position of the dragged node while dragging.
   */
  dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  /**
   * Allows the simulation to 'cool' to the point that nodes stop moving.
   *   The simulation does not stop while alphaTarget (default 0, set at 0.3 by dragstarted) > alphaMin (default 0.001)
   */
  dragended() {
    if (!d3.event.active && this.forceSimulation) this.forceSimulation.alphaTarget(0);
    if (this._fixDraggedNodes) {
      // nodes once dragged stay where you put them
      // elegant compromise
      d3.event.subject.fx = d3.event.subject.x;
      d3.event.subject.fy = d3.event.subject.y;
    } else {
      // nodes snap back in to place
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }
  }


  //////////////////
  // DATA MAPPING //
  //////////////////

  /**
   * primary data model shaper.
   */
  private asGraph(inputs: SzNetworkGraphInputs) {
    const showLinkLabels = inputs.showLinkLabels;
    const data = (inputs && inputs.data) ? inputs && inputs.data : undefined;
    // if (data && data.data) data = data.data;

    const entityPaths = data.entityPaths;
    const entitiesData = data.entities;
    const entityIndex = [];
    const nodes = [];
    const links = [];
    const linkIndex = [];
    const queriedEntityIds = [];
    const coreEntityIds = [];
    const coreLinkIds = [];
    const primaryEntities = this._entityIds.map( parseInt );

    //console.log('SzRelationshipNetworkGraph.asGraph: ', inputs, data, entitiesData);

    // Identify queried nodes and the nodes and links that connect them.
    entityPaths.forEach( (entPath) => {
      if (!queriedEntityIds.includes(entPath.startEntityId)) {
        queriedEntityIds.push(entPath.startEntityId);
      }
      if (!queriedEntityIds.includes(entPath.endEntityId)) {
        queriedEntityIds.push(entPath.endEntityId);
      }

      const pathIds = entPath.entityIds;
      pathIds.forEach( (pEntId) => {
        if (!coreEntityIds.includes(pEntId)) {
          coreEntityIds.push(pEntId);
        }
      });
      pathIds.forEach( (pEntId, pEntInd) => {
        const linkArr = [pathIds[pEntInd], pathIds[pEntInd + 1]].sort();
        const linkKey = {firstId: linkArr[0], secondId: linkArr[1]};
        if (!SzRelationshipNetworkComponent.hasKey(coreLinkIds, linkKey)) {
          coreLinkIds.push(linkKey);
        }
      });
    });

    // Add a node for each resolved entity
    entitiesData.forEach(entNode => {
      const resolvedEntity  = entNode.resolvedEntity;
      const relatedEntRels  = entNode.relatedEntities.filter( (relEnt) => {
        return primaryEntities ? primaryEntities.indexOf(relEnt.entityId) >= 0 : false;
      } );

      //console.log('SzRelationshipNetworkGraph.asGraph: ',
      //relatedEntRels, entNode.relatedEntities);

      const relColorClasses = [];
      if(relatedEntRels && relatedEntRels.length) {
        //console.log('get color classes: ', relatedEntRels);
        relatedEntRels.forEach( (relEnt) => {
          if(relEnt.relationType == 'DISCLOSED_RELATION') { relColorClasses.push('graph-node-rel-disclosed'); }
          if(relEnt.relationType == 'POSSIBLE_MATCH') { relColorClasses.push('graph-node-rel-pmatch'); }
          if(relEnt.relationType == 'POSSIBLE_RELATION') { relColorClasses.push('graph-node-rel-prel'); }
        });
      } else if ( primaryEntities.indexOf( resolvedEntity.entityId ) > -1 ) {
        relColorClasses.push('graph-node-rel-primary');
      } else {
        //console.warn('no related ent rels for #'+ resolvedEntity.entityId +'.', entNode.relatedEntities, relatedEntRels);
      }

      const entityId = resolvedEntity.entityId;
      // Create Node
      entityIndex.push(entityId);
      const features = resolvedEntity.features;
      nodes.push({
        isQueriedNode: queriedEntityIds.includes(entityId),
        isCoreNode: coreEntityIds.includes(entityId),
        iconType: SzRelationshipNetworkComponent.getIconType(resolvedEntity),
        entityId: entityId,
        orgName: resolvedEntity.entityName,
        relationTypeClasses: relColorClasses,
        name: resolvedEntity.entityName,
        address: resolvedEntity.addressData && resolvedEntity.addressData.length > 0 ? resolvedEntity.addressData[0] : SzRelationshipNetworkComponent.firstOrNull(features, "ADDRESS"),
        phone: resolvedEntity.phoneData && resolvedEntity.phoneData.length > 0 ? resolvedEntity.phoneData[0] : SzRelationshipNetworkComponent.firstOrNull(features, "PHONE"),
        dataSources: resolvedEntity.recordSummaries.map((ds) =>  ds.dataSource ),
        recordSummaries: resolvedEntity.recordSummaries,
        styles: []
      });
    });

    // Add links between resolved entities.
    entitiesData.forEach(entityInfo => {
      const entityId = entityInfo.resolvedEntity.entityId;
      const relatedEntities = entityInfo.relatedEntities;
      relatedEntities.forEach(relatedEntity => {

        const relatedEntityId = relatedEntity.entityId;
        const linkArr = [entityId, relatedEntityId].sort();
        const linkKey = {firstId: linkArr[0], secondId: linkArr[1]};
        // Only add links between resolved entities
        // TODO Add links to related entities not in resolved entities to show where the network can be expanded.
        if (!SzRelationshipNetworkComponent.hasKey(linkIndex, linkKey) && entityIndex.indexOf(relatedEntityId) !== -1) {
          linkIndex.push(linkKey);
          links.push({
            source: entityIndex.indexOf(entityId),
            target: entityIndex.indexOf(relatedEntityId),
            matchLevel: relatedEntity.matchLevel,
            matchKey: relatedEntity.matchKey,
            isCoreLink: SzRelationshipNetworkComponent.hasKey(coreLinkIds, linkKey),
            id: linkIndex.indexOf(linkKey)
          });
        }
      });
    });

    // GRAPH CONSTRUCTED
    return {
      nodes: nodes,
      links: links
    };
  }

  static firstOrNull(features, name) {
    return features && features[name] && [name].length !== 0 ? features[name][0]["FEAT_DESC"] : null;
  }

  static hasKey(usedLinks, linkKey) {
    return usedLinks.filter(key => key.firstId === linkKey.firstId && key.secondId === linkKey.secondId).length !== 0;
  }

  static getIconType(resolvedEntity) {
    let retVal = 'default';
    if(resolvedEntity && resolvedEntity.records) {
      resolvedEntity.records.slice(0, 9).forEach(element => {
        if(element.nameOrg || (element.addressData && element.addressData.some((addr) => addr.indexOf('BUSINESS') > -1))) {
          retVal = 'business';
        } else if(element.gender && (element.gender === 'FEMALE' || element.gender === 'F') ) {
          retVal = 'userFemale';
        } else if(element.gender && (element.gender === 'MALE' || element.gender === 'M') ) {
          retVal = 'userMale';
        }
      });
    }
    return retVal;
  }

  /**
   * This uses the RAW data model. It's incompatible with the non-raw data.
   * use getIconType with non-raw data instead.
   * @param resolvedEntity
   * @internal
   * @deprecated
   */
  static getIconTypeOld(resolvedEntity) {
    // Look for type information in the first 10 records.
    const recordsArr = resolvedEntity["RECORDS"].slice(0, 9);
    for (let i = 0; i < recordsArr.length; i++) {
      const elem = recordsArr[i];
      const data = elem["JSON_DATA"];
      if (data) {
        if (data["NAME_ORG"]) {
          return 'business';
        } else if (data["GENDER"] === 'FEMALE' || data["GENDER"] === 'F') {
          return 'userFemale';
        } else if (data["GENDER"] === 'MALE' || data["GENDER"] === 'M') {
          return 'userMale';
        }
      }
    }
    return 'default';
  }
  /** get sources summary lines as string array */
  private static sourcesAsStringArray(recordSummaryArray: any[], records: any[]): string[] {
    const retValue = [];

    for (let i = 0; i < recordSummaryArray.length; i++) {
      const entry = recordSummaryArray[i];
      if (entry.recordCount > 1) {
        retValue.push(`${ entry.dataSource } (${entry.recordCount})`);
      } else {
        const recordId = SzRelationshipNetworkComponent.getRecordId(records, entry.dataSource);
        retValue.push(`${ entry.dataSource } ${recordId}`);
      }
    }
    return retValue;
  }

  private static getRecordId(records: any[], targetDataSource: any) {
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (record.dataSource === targetDataSource) {
        let recordId: string = record.recordId;

        const recordCharLimit = Math.max(this.SOURCE_LINE_CHAR_LIMIT - targetDataSource.toString().length - 1, this.MIN_RECORD_ID_LENGTH);

        if (recordId.toString().length > recordCharLimit) {
          recordId = recordId.substring(0, recordCharLimit) + '...';
        }
        return recordId;
      }
    }
    return '';
  }

  /** get array of datasources present in network data */
  public static getDataSourcesFromEntityNetworkData(data: SzEntityNetworkData): string[] {
    const _datasources = [];
    if(data && data.entities && data.entities.map) {
      // flatten first
      const entititiesDS = data.entities.map( (entity) => {
        if(entity.resolvedEntity.recordSummaries && entity.resolvedEntity.recordSummaries.map) {
          return entity.resolvedEntity.recordSummaries.map( (_ds) => _ds.dataSource);
        }
        return entity.resolvedEntity.recordSummaries;
      });
      entititiesDS.forEach( (element: string[]) => {
        if(element && element.forEach) {
          element.forEach( (_dsString: string) => {
            if(_datasources.indexOf(_dsString) === -1) {
              _datasources.push(_dsString);
            }
          });
        }
      });
    }
    return _datasources;
  }
}
