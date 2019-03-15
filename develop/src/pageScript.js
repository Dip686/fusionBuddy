import PageCore from './internal/page-core';
import { BROWSER_CHROME, GET_CHARTS } from './utilities/constants';

(function (tabWindow) {
	//TODO detect browser
	const pageCoreInstance = new PageCore(BROWSER_CHROME);
	pageCoreInstance.initExtension();

	try {
		/**
		* Listening to all events thrown by fusionCharts on any
		* fusionCharts component and
		* logging them. This ensures we have lifecycle track of all components  
		*/
		FusionCharts.addEventListener('*', function registerEventLogs(e) {
			pageCoreInstance.onFcEvent(e);
		});
	} catch (err) {
		// suppressing error for other pages which does not hold FusionChart var
	}

	/**
	 * We get this event from background.js 
	 * It tells the pageScript to scrape chart data fromsthe page on whcih this
	 * is running
	 */
	tabWindow.addEventListener(GET_CHARTS, function getChartsInPage(event) {
		pageCoreInstance.onGetChartsEvent(event);
	}, false);
})(window);
