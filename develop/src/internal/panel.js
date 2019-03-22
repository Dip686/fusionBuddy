import JSONFormatter from 'json-formatter-js';
import { GOT_CHARTS, GOT_EVENTS, GET_CHARTS, GOT_LIFE_CYCLE_LOG } from '../utilities/constants';
import  { fetchFreshDataForComponent, fireHighlightEvent,buildTree, setSelectedComponentId, orderEvents, pluckEventsInfo} from '../utilities/panelutilities/panelUtil';
import { isEmpty } from '../utilities/utils';
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
//our pagescript.
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
		compInnerHTML = buildTree(components);

		if (componentViewID.childNodes.item('jstree_demo_div')) {
			document.getElementById('jstree_demo_div').remove();
		}
		let tempDiv = document.createElement('div');
		tempDiv.id = "jstree_demo_div";
		tempDiv.classList.add('f-b-padding-sides-20');
		componentViewID.appendChild(tempDiv);

		compInnerHTML = `<ul><li data-component-id="${components.id}">chart ${compInnerHTML} </li></ul>`;

		document.getElementById('jstree_demo_div').innerHTML = compInnerHTML;
		jsTreeObj = $('#jstree_demo_div').jstree({});

		//Setting eventListeners to the nodes of js tree
		$("#jstree_demo_div").on("changed.jstree", function (evt, data) {
			var componentId = $('#' + data.selected[0]).data('component-id');
			setSelectedComponentId(panelContext, componentId);
			setSelectedTab( panelContext.currentSelectedTab || '#params-tab');
			panelPort && panelPort.postMessage({ type: 'GET_LIFE_CYCLE_LOG', payload: { componentId } });
			fireHighlightEvent(panelPort, componentId);
		});

		$('#jstree_demo_div').on("hover_node.jstree", function (e, data) {
			fireHighlightEvent(panelPort, $('#' + data.node.id).data('component-id'));
		});

		// $('#jstree_demo_div').on("certainEvent", function onCertainEvent(e,data) {
		// 	var hoveredNode = "someNode";
		// 	//Lets tell background about this

		// });

		$('.switch-tab-button').off();
		$('.switch-tab-button').on('click', function () {
			setSelectedTab($(this).attr('href'));
		});
	} else if (msg.type === GOT_LIFE_CYCLE_LOG) {
		panelContext.currentSelectedComponentLifecycle[panelContext.currentSelectedComponentId] = msg.payload;
	}
});

document.getElementById('refresh-btn').addEventListener('click', function refreshData() {
	fetchFreshDataForComponent(panelPort, panelContext.currentSelectedComponentId);
});

init();

function setSelectedTab(tabId) {
	panelContext.currentSelectedTab = tabId;
	selectTabInternal();
}

function selectTabInternal() {
	var dataSection = $('#data-section');

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
	dataSection.find(panelContext.currentSelectedTab).html(jsonFormatter.render());
}
function init() {
	setSelectedTab('#params-tab');
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
		Event: ${e.eventId} ${e.hourMinuteSec}
	`;
	var newLiComp = document.createElement('li');
	newLiComp.innerHTML = 
	`
		Component: ${e.componentId}
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