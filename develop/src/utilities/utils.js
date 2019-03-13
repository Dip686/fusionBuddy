export function postWindowMessage(action, payload) {
  window.postMessage({ action, payload }, '*');
}

export function getComponentId(component) {
  return component.getId ? component.getId() : component.id;
}

export function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}

/**
 * 
 * @param {any} items - An object having list of charts on the page 
 */
export function getComponentTree(items) {
  let tree;
  for (let item in items) {
    if (items.hasOwnProperty(item)) {
      const chartItem = items[item];
      tree = createTree(chartItem.apiInstance);
      tree.evtListeners = getAllListenersOnChart(chartItem);
      tree.evtExtListeners = [];
      tree.id = getComponentId(items[item]);
    }
  }
  return tree;
}

/**
 * Creates the chart and component tree
 * This tree has the chartObject as root and the all components in
 * the hierrarchy forms the nodes
 * @param chart: FusionCharts chart object 
 */
function createTree(chart) {
  let tree = {};
  if (!isEmpty(chart._components)) {
    let components = chart._components;
    for (let component in components) {
      if (components.hasOwnProperty(component)) {
        let compVal = components[component],
          subTree = {};
        if (compVal.length > 0) {
          for (let index = 0; index < compVal.length; index++) {
            const listenersOnComponent = getAllListenersOnComponent(compVal[index]),
            compId = getComponentId(compVal[index]);
            subTree[compId] = createTree(compVal[index]);
            subTree[compId].id = compId;
            subTree[compId].config = getConfig(compVal[index].config);
            subTree[compId].evtListeners = listenersOnComponent.evtListeners;
            subTree[compId].evtExtListeners = listenersOnComponent.evtExtListeners;
          }
          tree[component] = subTree;
        }
      }
    }
  } else {
    // return chart.getGraphicalElement();
  }
  return tree;
}

/**
 * The raw  config object in FC charts or components are not serialized properly
 * and thus cannot be sent through postMessage to the devtool horizon.
 * This method plucks only required properties from the config and 
 * returns a new object with those properties 
 * @param {*} config 
 */
function getConfig(config) {
  let finalConfig = {};
  if (!isEmpty(config)) {
    for (let item in config) {
      if (config.hasOwnProperty(item)) {
        if (config[item] && config[item] instanceof Object) {
          if (config[item] instanceof Array) {
            let tempArr = [];
            for (let index = 0; index < config[item].length; index++) {
              const element = config[item][index];
              if (element) {
                if (element instanceof Array) {
                  tempArr.push(getConfig(element));
                } else if (element instanceof Function) {
                  tempArr.push(element.toString());
                } else if (element.constructor.toString().includes('Object')) {
                  tempArr.push(getConfig(element));
                } else if (!element.constructor) {
                  tempArr.push(element);
                }
              } else {
                tempArr.push(element);
              }
            }
            finalConfig[item] = tempArr;
          } else if (config[item] instanceof Function) {
            finalConfig[item] = config[item].toString();
          } else if (config[item].constructor.toString().includes('Object')) {
            finalConfig[item] = getConfig(config[item]);
          }
          else {
            finalConfig[item] = config[item].toString();
            if (!config[item].node) {
            }
          }
        } else {
          finalConfig[item] = config[item];
        }
      }
    }
  }
  return finalConfig;
}

function getAllListenersOnChart(chartObject) {
  const listenersOnChartObject = [];
  for (let eventListener in chartObject._evtListeners) {
    if (chartObject._evtListeners.hasOwnProperty(eventListener)) {
      // eventListenersList.push(chartObject._evtListeners[eventListener]);
      listenersOnChartObject.push(eventListener);
    }
  }

  return listenersOnChartObject;
}

function getAllListenersOnComponent(component) {
  const evtListeners = [];
  const evtExtListeners = [];
  for (let eventListener in component._evtListeners) {
    if (component._evtListeners.hasOwnProperty(eventListener)) {
      evtListeners.push(eventListener);
    }
  }
  for (let eventListener in component._extListeners) {
    if (component._extListeners.hasOwnProperty(eventListener)) {
      evtExtListeners.push(eventListener);
    }
  }
  return {
    evtListeners,
    evtExtListeners
  };
}