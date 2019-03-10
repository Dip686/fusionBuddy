const lifeCycleLog = {},
  eventRegister = {
    eventLog: []
  };
lifeCycleLog.getEventsSorted = getEventsSorted;
lifeCycleLog.getEventCount = getEventCount;
lifeCycleLog._components = {};
eventRegister.fetchEventsLog = fetchEventsLog;
try {
  FusionCharts.addEventListener('*', logEvent);
} catch (err) {
  // suppressing error for other pages which does not hold FusionChart var
}

window.addEventListener('GET_CHARTS', function getChartsInPage(event) {
  //You can also use dispatchEvent
  console.log('inside pageScript window.', event);
  let tree = getComponentTree(FusionCharts.items),
    lifeCycleObj = JSON.parse(JSON.stringify(lifeCycleLog));
  //   componentId = event.detail && event.detail.id;
  // if (componentId) {
  //   lifeCycleObj = lifeCycleLog[componentId];
  // }
  window.postMessage({action: 'GOT_CHARTS', payload: {tree, lifeCycleObj}}, '*');
}, false);

FusionCharts.addEventListener('*', function registerEventLogs(e){
  registerEvents(e);
  window.postMessage({action: 'GOT_EVENTS', payload: eventRegister.eventLog}, '*');
});
function getComponentTree (items) {
  let tree;
  for (let item in items) {
    if (items.hasOwnProperty(item)) {
      const chartItem = items[item];
      tree = createTree(chartItem.apiInstance);
      tree.evtListeners = getAllListenersOnChart(chartItem);
      tree.evtExtListeners = [];
      console.log('item', items[item]);
      tree.id = items[item].getId ? items[item].getId() : items[item].id;
    }
  }
  return tree;
}
function createTree (chart) {
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
              compId = compVal[index].getId ? compVal[index].getId() : compVal[index].id;
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
  }else {
    // return chart.getGraphicalElement();
  }
  return tree;
}
function isEmpty(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true;
}

function getConfig (config) {
  let finalConfig = {};
  if (!isEmpty(config)) {
    for (let item in config) {
      if (config.hasOwnProperty(item) ) {
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
                }else if (element.constructor.toString().includes('Object')) {
                  tempArr.push(getConfig(element));
                }else if (!element.constructor){
                  // console.log(element);
                  // console.log(typeof element);
                  // console.log(element.constructor.toString());
                  tempArr.push(element);
                }
              }else {
                tempArr.push(element);
              }
            }
            finalConfig[item] = tempArr;
          }else if (config[item] instanceof Function) {
            finalConfig[item] = config[item].toString();
          }else if (config[item].constructor.toString().includes('Object')) {
            finalConfig[item] = getConfig(config[item]);
          }
          else {
            finalConfig[item] = config[item].toString();
            if (!config[item].node) {
              // console.log(config[item]);
              // console.log(config[item].constructor);
              // console.log(config[item].constructor && config[item].constructor.toString());            
              // finalConfig[item] = config[item];
            }
          }
        }else {
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
  const listenersOnComponent = {};
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

function logEvent (e) {
  const key = e.sender.getId ? e.sender.getId() : e.sender.id;
  let meta = lifeCycleLog[key];
  if (!meta) {
    meta = { eventStream: [] };
    lifeCycleLog[key] = meta;
  }
  meta[e.type] = meta[e.type] ? meta[e.type] + 1 : 1;
  meta.eventStream.push({
    type: e.type,
    timestamp: Date.now()
  });
}
function getEventsSorted(componentId, eventName) {
  if (!!!componentId || !lifeCycleLog[componentId]) {
    console.log(`Invalid component ID requested method#getEventsSorted ID#${componentId}`);
  }
  const sortedEvents = sortEventStreamASC(lifeCycleLog[componentId].eventStream);
  if (eventName) {
    return sortedEvents.filter(evtName => {
      return evtName === eventName;
    });
  }
  return sortedEvents;
}

function getEventCount(componentId, type) {
  if (!!!componentId || !lifeCycleLog[componentId]) {
    console.log(`Invalid component ID requested method#getEventCount ID#${componentId}`);
  }
  if (!!!type || typeof type != "string") {
    console.log(`Invalid eventType#${type} requested method#getEventCount ID#${componentId}`);
  }
  return lifeCycleLog[componentId][type] || 0;
}
function sortEventStreamASC(eventStream) {
  return [].concat(eventStream).sort((i, j) => {
    if (i.timestamp > j.timestamp) {
      return 1;
    } else if (i.timestamp < j.timestamp) {
      return -1;
    } else {
      return 0;
    }
  }).map((v) => {
    return v.type;
  });
}
function registerEvents (e) {
  if (e.sender) {
    eventRegister.eventLog.push({
      eventId: e.type,
      // reference: e.sender.apiInstance || e.sender,
      referenceId: e.sender.apiInstance ? e.sender.apiInstance.getId ? e.sender.apiInstance.getId() : e.sender.apiInstance.id :
        e.sender ? e.sender.getId ? e.sender.getId() : e.sender.id : {}
    });
  }

}
function fetchEventsLog( eventId = 'all', componentId = 'all') {
  let eventLog = eventRegister.eventLog;
  if (eventId.toLowerCase() === 'all' && componentId.toLowerCase() === 'all') {
    return eventLog;
  }else if (eventId.toLowerCase() === 'all' && componentId.toLowerCase() !== 'all') {
    return eventLog.filter((event) => {
      return (event.referenceId === componentId);
    });
  }else if (eventId.toLowerCase() !== 'all' && componentId.toLowerCase() === 'all') {
    return eventLog.filter((event) => {
      return (event.eventId === eventId);
    });
  }else {
    return eventLog.filter((event) => {
      return (event.eventId === eventId && event.referenceId === componentId);
    });
  }
}
