import { Component, OnInit } from '@angular/core';
import { SzGraphTestService } from '../services/graph-test.service';

@Component({
  selector: 'sz-graph-test-component',
  templateUrl: './graph-test.component.html',
  styleUrls: ['./graph-test.component.scss']
})
export class SzGraphTestComponent implements OnInit {
  public get testServiceStr(): string {
    return this.testService.text;
  }
  constructor(public testService: SzGraphTestService) { }

  ngOnInit() {
  }

}
