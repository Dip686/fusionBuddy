import { HIGHLIGHT_COMPONENT, GET_CHARTS, SUMMON_FUSION_BUDDY } from "./utilities/constants";

// start connection in content script
let contentPort = chrome.runtime.connect({
	name: 'content-script'
});

//Append your pageScript.js to "real" webpage. So will it can full access to webpate.
var s = document.createElement('script');
s.src = chrome.extension.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(s);
//Our pageScript.js only add listener to window object, 
//so we don't need it after it finish its job. But depend your case, 
//you may want to keep it.
// s.parentNode.removeChild(s);

//For any communication from devtools to contentScript via background 
contentPort.onMessage.addListener(handleMessageFromDevtools);
//For any window events from page to this contentScript
window.addEventListener('message', handleMessageFromPage, false);

function handleMessageFromDevtools(message) {
	try {
		if (message.type === GET_CHARTS) {
			onGetCharts(message);
		} else if (message.type === "GET_UPDATED_DATA") {
			onGetChartsByComponentId(message.payload.componentId);
		} else if (message.type === 'GET_LIFE_CYCLE_LOG') {
			onGetLifeCycleLog(message.payload.componentId);
		} else if (message.type.includes('GET_CHARTS')) {
			onGetChartsByComponentId(message.type.replace('GET_CHARTS_', ''));
		} else if (message.type === HIGHLIGHT_COMPONENT) {
			onHighlighComponentById(message.payload.componentId);
		}
	}catch(e) {
		//suppressing error
	}
}

function handleMessageFromPage(event) {
	try {
		if (event.data.action === 'GOT_CHARTS') {
			contentPort.postMessage({ type: 'GOT_CHARTS', payload: event.data.payload });
		} else if (event.data.action === 'GOT_EVENTS') {
			contentPort.postMessage({ type: 'GOT_EVENTS', payload: event.data.payload });
		} else if (event.data.action === 'GOT_LIFE_CYCLE_LOG') {
			contentPort.postMessage({ type: 'GOT_LIFE_CYCLE_LOG', payload: event.data.payload });
		} else if (event.data.action === SUMMON_FUSION_BUDDY) {
			if (event.data.payload.enable) {
				chrome.runtime.sendMessage({ enableFB: true });
			} else {
				chrome.runtime.sendMessage({ enableFB: false });
			}
		}
	} catch(e) {
		// suppressing error
	}
}

function onGetCharts(message) {
	let event = new CustomEvent('GET_CHARTS');
	window.dispatchEvent(event);
	return true;
}

function onGetChartsByComponentId(id) {
	let event = new CustomEvent('GET_CHARTS', {
		detail: {
			id
		}
	});
	window.dispatchEvent(event);
	return true;
}

function onHighlighComponentById(componentId, chartId) {
	let event = new CustomEvent(HIGHLIGHT_COMPONENT, {
		detail: {
			componentId
		}
	});
	window.dispatchEvent(event);
	return true;
}

function onGetLifeCycleLog(id) {
	let event = new CustomEvent('GET_LIFE_CYCLE_LOG', {
		detail: {
			id
		}
	});
	window.dispatchEvent(event);
	return true;
}