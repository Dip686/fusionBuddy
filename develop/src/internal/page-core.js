import { removeExistingHighlights } from "../utilities/utils";
import Store from './store';
import { BROWSER_CHROME } from "../utilities/constants";

export default class PageCore {
  constructor(browser) {
    this.browser = browser;
    this.store = new Store();
  }

  initExtension() {
    switch (this.browser) {
      case BROWSER_CHROME: {
        this.initChromeExtension();
        break;
      }
    }
  }

  initChromeExtension () {
    document.body.addEventListener('mouseover', function hideHighlights() {
      removeExistingHighlights();
    });
  }
}