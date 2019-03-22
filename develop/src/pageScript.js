import Event from './internal/events/event';
import Config from './internal/configs/config';
import { addModule, postWindowMessage } from './utilities/utils';
import { SUMMON_FUSION_BUDDY } from './utilities/constants';
import Highlighter from './internal/highlighter/highlighter';

(function (tabWindow) {
	try {
		if (typeof FusionCharts !== 'undefined') {
			//FusionBuddy extension is applicable for this page
			postWindowMessage(SUMMON_FUSION_BUDDY, { enable: true });
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
		} else {
			postWindowMessage(SUMMON_FUSION_BUDDY, { enable: false });
		}
	} catch (err) {
		// suppressing error for other pages which does not hold FusionChart var
	}
})(window);
