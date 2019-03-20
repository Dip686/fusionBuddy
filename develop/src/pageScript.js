import PageCore from './internal/page-core';
import { BROWSER_CHROME, GET_CHARTS, HIGHLIGHT_COMPONENT } from './utilities/constants';
import Event from './internal/events/event';
import Config from './internal/configs/config';
import { addModule } from  './utilities/utils';
import  { ATTACH_LISTENERS } from './utilities/constants';

(function (tabWindow) {
	try {
		if (FusionCharts) {
			const eventObj = addModule(Event),
			configObj = addModule(Config);
			// window.addEventListener(ATTACH_LISTENERS, function attachListeners () {
			// 	eventObj.enableListeners(tabWindow);
			// 	configObj.enableListeners(tabWindow);
			// });
			eventObj.enableListeners(tabWindow);
			configObj.enableListeners(tabWindow);
      
      
      /**
       * We get this event from background.js 
       * It tells the pageScript to scrape chart data fromsthe page on whcih this
       * is running
       */
      tabWindow.addEventListener(GET_CHARTS, function getChartsInPage(event) {
        pageCoreInstance.onGetChartsEvent(event);
      }, false);

      tabWindow.addEventListener(HIGHLIGHT_COMPONENT, function highlighComponents(event) {
        pageCoreInstance.onHighlightComponentById(event);
      }, false);
		}
	} catch (err) {
		// suppressing error for other pages which does not hold FusionChart var
	}
})(window);
