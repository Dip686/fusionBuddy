let panelPort = chrome.runtime.connect({
	name: 'panel-commn'
});
const panelContext = {
	currentSelectedTab: '#params-tab',
	currentSelectedComponentId: null,
	currentSelectedComponent: {},
	currentSelectedComponentLifecycle: {},
	_components: {}
};

panelPort && panelPort.postMessage({ type: 'GET_CHARTS', payload: {} });

panelPort.onMessage.addListener(function (msg) {
	if (msg.type === 'GOT_EVENTS') {
		console.log('msg received events', msg);
	} else if (msg.type === 'GOT_CHARTS') {
		let components = msg.payload.tree,
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
			fetchFreshDataForComponent(panelContext.currentSelectedComponentId);
			
		});
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
			dataToShow = panelContext.currentSelectedComponent;
			break;
		case "#events-tab":
			dataToShow = panelContext.currentSelectedComponent ? pluckEventsInfo(panelContext.currentSelectedComponent) : {};
			break;
		case "#life-cycle-tab":
			dataToShow = panelContext.currentSelectedComponentLifecycle || {};
			break;
	}

	const jsonFormatter = new JSONFormatter.default(dataToShow);
	dataSection.find(panelContext.currentSelectedTab)
		.find('.tab-content').html(jsonFormatter.render());
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
function getComponentById(components, id) {
	for (let prop in components) {
		if (components.hasOwnProperty(prop)) {
			const component = components[prop];
			if (prop === id) {
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