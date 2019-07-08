import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SzGraphTestService {
  public testStr = 'hey, it works';
  public get text() {
    return this.testStr;
  }
  constructor() { }
}
