import { isEmpty } from '../utils';
import { HIGHLIGHT_COMPONENT } from '../constants';
/**
 * API to postMessage GET_UPDATED_DATA background.js
 * @param {Object} panelPort opne port used to commn between panel and background
 * @param {string} componentId holds the auto-generated id of the compoenent
 */
export function fetchFreshDataForComponent(panelPort, componentId) {
	panelPort && panelPort.postMessage({ type: 'GET_UPDATED_DATA', payload: { componentId } });
}
/**
 * API to postMessage HIGHLIGHT_COMPONENT background.js
 * @param {Object} panelPort opne port used to commn between panel and background
 * @param {string} componentId holds the auto-generated id of the compoenent
 */
export function fireHighlightEvent(panelPort, componentId) {
	panelPort && panelPort.postMessage({ type: HIGHLIGHT_COMPONENT, payload: { componentId } });
}

/**
 * Utility API to build HTML tree for a compoenents that is used for treeview creation
 * @param {Object} components holds the compoenent instance for which tree needs to be created
 * @returns HTML DOM string
 */
export function buildTree(components) {
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
/**
 * PANEL API used in setting panel component and its ID
 * @param {Object} panelContext object that stores data used in panel's context
 * @param {string} componentId holds the componenet ID
 */
export function setSelectedComponentId(panelContext, componentId) {
	panelContext.currentSelectedComponentId = componentId;
	if (panelContext._components.id === panelContext.currentSelectedComponentId) {
		panelContext.currentSelectedComponent = panelContext._components || {};
	} else {
		panelContext.currentSelectedComponent = getComponentById(panelContext._components, panelContext.currentSelectedComponentId) || {}
	}
}
/**
 * COMPONENT API to fetch component information based on id
 * @param {Object} components holds all components object
 * @param {String} id the selected component id
 */
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
/**
 * EVENT API sort the eventstream based on timestamp
 * @param {Object} dataToShow holds the object content to display
 */
export function orderEvents(dataToShow) {
	if (dataToShow.eventStream) {
		const reducer = (accumulator, currentValue) => accumulator + ', ' + currentValue.type;
		return dataToShow.eventStream.reduce(reducer, '').replace(', ', '');
	}
	return '';
}
/**
 * EVENT API to pluck the eventListener and eventExtListeners
 * @param {Object} obj holds the entire data object to show
 */
export function pluckEventsInfo(obj) {
	return obj
		? {
			evtListeners: obj.evtListeners,
			evtExtListeners: obj.evtExtListeners
		}
		: {};
}