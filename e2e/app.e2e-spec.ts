import { SpringTemplateGeneratorPage } from './app.po';

describe('spring-template-generator App', () => {
  let page: SpringTemplateGeneratorPage;

  beforeEach(() => {
    page = new SpringTemplateGeneratorPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
