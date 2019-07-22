import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sdk-graph-components';

  public onContextMenuClick(event: any) {
    console.log('Context Menu Click for: ', event);
  }
}
