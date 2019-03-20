import Event from './internal/events/event';
import Config from './internal/configs/config';
import { addModule } from  './utilities/utils';
import  { ATTACH_LISTENERS } from './utilities/constants';
import Highlighter from './internal/highlighter/highlighter';

(function (tabWindow) {
	try {
		if (FusionCharts) {
			const eventObj = addModule(Event),
			configObj = addModule(Config),
			highlighter = addModule(Highlighter);
			// window.addEventListener(ATTACH_LISTENERS, function attachListeners () {
			// 	eventObj.enableListeners(tabWindow);
			// 	configObj.enableListeners(tabWindow);
			// });
			eventObj.enableListeners(tabWindow);
			configObj.enableListeners(tabWindow);
			highlighter.enableListeners(tabWindow);
		}
	} catch (err) {
		// suppressing error for other pages which does not hold FusionChart var
	}
})(window);
