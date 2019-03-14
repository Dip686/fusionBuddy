import { postWindowMessage, getComponentTree } from "../utilities/utils";
import Store from './store';
import { BROWSER_CHROME, GOT_CHARTS, GOT_EVENTS } from "../utilities/constants";

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

  initChromeExtension () {}

  onFcEvent(e) {
    const registeredEvent = this.store.registerEvents(e);
    this.store.logLifecycle(e);
    postWindowMessage(GOT_EVENTS, registeredEvent);
  }

  onGetChartsEvent(e) {
    const tree = getComponentTree(FusionCharts.items),
      lifeCycleObj = JSON.parse(JSON.stringify(this.store.lifeCycleLog));
    postWindowMessage(GOT_CHARTS, {tree, lifeCycleObj});
  }
}