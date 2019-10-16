import { Component, Input, ViewChild } from '@angular/core';
import { NodeFilterPair, SzRelationshipNetworkComponent } from '@senzing/sdk-graph-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sdk-graph-components';
  @Input() public showGraphMatchKeys = false;
  @ViewChild(SzRelationshipNetworkComponent) graph: SzRelationshipNetworkComponent;

  public toggleGraphMatchKeys(event): void {
    let _checked = false;
    if (event.target) {
      _checked = event.target.checked;
    } else if (event.srcElement) {
      _checked = event.srcElement.checked;
    }
    // console.warn('toggleGraphMatchKeys: ', _checked);
    this.showGraphMatchKeys = _checked;
  }

  public get entityNodeModifiers(): NodeFilterPair[] {
    return [
      { selectorFn: this.inOwners, modifierFn: this.setOwnersColor },
      { selectorFn: this.inCompanies, modifierFn: this.setCompaniesColor }
    ];
  }

  public get entityNodeFilters(): NodeFilterPair[] {
    return [
      { selectorFn: (nodeData) => {
        return nodeData.dataSources.indexOf('SAMPLE PERSON') >= 0;
      }}
    ];
  }

  isInDataSource(dataSource, nodeData) {
    // console.log('fromOwners: ', nodeData);
    return nodeData.dataSources.indexOf(dataSource) >= 0;
  }

  public styleOwnersByClass(nodeList) {
    nodeList.attr('class', function(d) {
      return ['highlighted'].concat(d.relationTypeClasses).join(' ');
    });
  }

  public setNodeFillColor(color, nodeList) {
    // nodeList.attr('fill', '#e6b100');
    nodeList.style('fill', color);
  }

  public inOwners = this.isInDataSource.bind(this, 'OWNERS');
  public inCompanies = this.isInDataSource.bind(this, 'COMPANIES');
  public setOwnersColor = this.setNodeFillColor.bind(this, '#e6b100');
  public setCompaniesColor = this.setNodeFillColor.bind(this, '#0075e6');

  modifyData(evt) {
    if ( this.graph ) {
      this.graph.modify = {
        selectorFn: (node) => true, // select all nodes
        modifierFn: (data) => { data.newProp = true; return data; } // add new property
      };
      console.log('data after modification: ', this.graph.chartData);
    }
  }

  public onContextMenuClick(event: any) {
    console.log('Context Menu Click for: ', event);
  }
}
