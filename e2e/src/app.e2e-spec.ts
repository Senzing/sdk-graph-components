import { AppPage } from './app.po';

describe('@senzing/sdk-graph-components: Suite 1', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('title should be "@senzing/sdk-graph-components"', async () => {
    page.navigateTo();
    const title = await page.getTitle();
    expect( title ).toEqual('@senzing/sdk-graph-components');
  });
});
