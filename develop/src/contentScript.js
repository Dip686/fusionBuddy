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
	if (message.type === 'GET_CHARTS') {
		onGetCharts(message);
	} else if (message.type === "GET_UPDATED_DATA") {
		onGetChartsByComponentId(message.payload.componentId);
	} else if (message.type.includes('GET_CHARTS')) {
		onGetChartsByComponentId(message.type.replace('GET_CHARTS_', ''));
	}
}

function handleMessageFromPage(event) {
	if (event.data.action === 'GOT_CHARTS') {
		contentPort.postMessage({ type: 'GOT_CHARTS', payload: event.data.payload });
	} else if (event.data.action === 'GOT_EVENTS') {
		contentPort.postMessage({ type: 'GOT_EVENTS', payload: event.data.payload });
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
