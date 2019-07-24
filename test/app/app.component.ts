import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sdk-graph-components';
  @Input() public showGraphMatchKeys = false;

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

  public onContextMenuClick(event: any) {
    console.log('Context Menu Click for: ', event);
  }
}
