import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  async getTitle() {
    return await browser.getTitle();
  }
}
