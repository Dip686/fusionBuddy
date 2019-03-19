import JSONFormatter from 'json-formatter-js';
import { GOT_CHARTS, GOT_EVENTS, GET_CHARTS, HIGHLIGHT_COMPONENT } from '../utilities/constants';

//panelPort stores connection of the chrome-extention's panel to the chrome runtime
//environment. This is a stay-alive connection.
let panelPort = chrome.runtime.connect({
	name: '' + chrome.devtools.inspectedWindow.tabId
});
//panelContext saves the current state of the panel,
//For example, which tab is selected, which component is selected, etc
const panelContext = {
	currentSelectedTab: '#params-tab',
	currentSelectedComponentId: null,
	currentSelectedComponent: {},
	currentSelectedComponentLifecycle: {},
	_components: {},
	_eventRegister: [],
	$stateListUl: null
};
//The first postMessage to background, background will relay it across horizon to
//our page.
panelPort && panelPort.postMessage({ type: GET_CHARTS, payload: {} });
//This listener handles messages to this panel from our page through the background.js 
//play as mediator
panelPort.onMessage.addListener(function (msg, sender) {
	console.log(sender && sender.tab && sender.tab.id);
	if (msg.type === GOT_EVENTS) {
		console.log("GOT_EVENT");
		setPanelComponentsStateOnEvents(msg.payload);
	} else if (msg.type === GOT_CHARTS) {
		let components = msg.payload.charts,
			compInnerHTML,
			jsTreeObj,
			componentViewID = document.getElementById('component-view-parent');
		console.log('msg received', msg);
		setPanelComponentsData(components);
		setPanelComponentsLifecylceData(msg.payload.lifeCycleObj);
		compInnerHTML = buildTree(components);

		if (componentViewID.childNodes.item('jstree_demo_div')) {
			document.getElementById('jstree_demo_div').remove();
		}
		let tempDiv = document.createElement('div');
		tempDiv.id = "jstree_demo_div";
		componentViewID.appendChild(tempDiv);

		compInnerHTML = `<ul><li data-component-id="${components.id}">chart ${compInnerHTML} </li></ul>`;

		document.getElementById('jstree_demo_div').innerHTML = compInnerHTML;
		jsTreeObj = $('#jstree_demo_div').jstree({});

		//Setting eventListeners to the nodes of js tree
		$("#jstree_demo_div").on("changed.jstree", function (evt, data) {
			var selectedComponentId = $('#' + data.selected[0]).data('component-id');
			setSelectedComponentId(selectedComponentId);
			setSelectedTab('#params-tab');
			// fetchFreshDataForComponent(panelContext.currentSelectedComponentId);
			fireHighlightEvent(selectedComponentId);
		});

		// $('#jstree_demo_div').on("certainEvent", function onCertainEvent(e,data) {
		// 	var hoveredNode = "someNode";
		// 	//Lets tell background about this

		// });

		$('.switch-tab-button').off();
		$('.switch-tab-button').on('click', function () {
			setSelectedTab($(this).data('tab-id'));
		});
	}
});

document.getElementById('refresh-btn').addEventListener('click', function refreshData() {
	fetchFreshDataForComponent(panelContext.currentSelectedComponentId);
});

init();

function fetchFreshDataForComponent(componentId) {
	panelPort && panelPort.postMessage({ type: 'GET_UPDATED_DATA', payload: { componentId } });
}

function fireHighlightEvent(componentId) {
	panelPort && panelPort.postMessage({ type: HIGHLIGHT_COMPONENT, payload: { componentId } });
}

function buildTree(components) {
	let str = '<ul>';
	for (let component in components) {
		if (component !== 'config' && component !== 'id' && component !== 'evtListeners' && component !== 'evtExtListeners' && components.hasOwnProperty(component)) {
			let compVal = components[component];
			compVal.id ? str += (`<li data-component-id="${compVal.id}">` + component) : str += (`<li data-component-id="${component}">` + component);
			if (!isEmpty(compVal)) {
				str += buildTree(compVal);
			}
			str += '</li>';
		}
	}
	str += '</ul>';
	return str;
}
function isEmpty(obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			return false;
	}
	return true;
}
function setSelectedComponentId(componentId) {
	panelContext.currentSelectedComponentId = componentId;
	if (panelContext._components.id === panelContext.currentSelectedComponentId) {
		panelContext.currentSelectedComponent = panelContext._components || {};
	} else {
		panelContext.currentSelectedComponent = getComponentById(panelContext._components, panelContext.currentSelectedComponentId) || {}
	}
}

function setSelectedTab(tabId) {
	panelContext.currentSelectedTab = tabId;
	selectTabInternal();
}

function selectTabInternal() {
	var dataSection = $('#data-section');
	dataSection.find('.panel-tab').hide();
	dataSection.find(panelContext.currentSelectedTab).show();

	let dataToShow = {};
	switch (panelContext.currentSelectedTab) {
		case "#params-tab":
			dataToShow = panelContext.currentSelectedComponent.config || {};
			break;
		case "#events-tab":
			dataToShow = panelContext.currentSelectedComponent ? pluckEventsInfo(panelContext.currentSelectedComponent) : {};
			break;
		case "#life-cycle-tab":
			dataToShow = panelContext.currentSelectedComponentLifecycle[panelContext.currentSelectedComponentId] || {};
			!isEmpty(dataToShow) && (dataToShow.eventsInOrder = orderEvents(dataToShow));
			break;
	}

	const jsonFormatter = new JSONFormatter(dataToShow);
	dataSection.find(panelContext.currentSelectedTab)
		.find('.tab-content').html(jsonFormatter.render());
}
function init() {
	setSelectedTab('#params-tab');
}
function orderEvents(dataToShow) {
	if (dataToShow.eventStream) {
		const reducer = (accumulator, currentValue) => accumulator + ', ' + currentValue.type;
		return dataToShow.eventStream.reduce(reducer, '').replace(', ', '');
	}
	return '';
}
function setPanelComponentsData(components) {
	panelContext._components = components;
	//TODO: Probably update views of all tabs
}
function setPanelComponentsLifecylceData(lifeCycleObj) {
	panelContext.currentSelectedComponentLifecycle = lifeCycleObj || {};
}
/**
 * Whenever some action happens on a chart on the page,
 * pageScript, through background.js let's us know about state changes and action name.
 * We are storing that in our panel.js to allow time-travel debugging in future
 * @param {any} eventToRegister 
 */
function setPanelComponentsStateOnEvents(eventToRegister) {
	panelContext._eventRegister.push(eventToRegister);
	timeTravelLog(eventToRegister);
}
/**
 * Adds an <li> to visual state-list <ul> 
 * @param {eventRegisterObject} e 
 */
function timeTravelLog(e) {
	var stateListUL = panelContext.$stateListUl;
	if (!stateListUL) {
		stateListUL = document.getElementById('state-list');
		panelContext.$stateListUL = stateListUL;
	}

	var newLiEvt = document.createElement('li');
	newLiEvt.innerHTML = 
	`
		Event: ${e.eventId}
	`;
	var newLiComp = document.createElement('li');
	newLiComp.innerHTML = 
	`
		Component: ${e.referenceId}
	`;
	newLiComp.classList.add('component-id-li');

	stateListUL.appendChild(newLiEvt);
	stateListUL.appendChild(newLiComp);
	//Always scroll to bottom of the list continuously on update
	stateListUL.parentElement.scrollTo({
		top:stateListUL.scrollHeight,
		behavior: 'smooth'
	});      
}
function getComponentById(components, id) {
	for (let prop in components) {
		if (components.hasOwnProperty(prop)) {
			const component = components[prop];

			if (prop === id  && component.id === id) {
				//Found it
				return component;
			} else {
				if (component && !isEmpty(component) && component instanceof Object) {
					//It's a component and thus searching for children
					const result = getComponentById(component, id);
					if (result) {
						return result;
					}
				}
			}
		}
	}
	return null;
}
function pluckEventsInfo(obj) {
	return obj
		? {
			evtListeners: obj.evtListeners,
			evtExtListeners: obj.evtExtListeners
		}
		: {};
}