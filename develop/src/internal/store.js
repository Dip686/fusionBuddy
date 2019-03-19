import { getComponentId } from "../utilities/utils";

export default class {
  constructor() {
    this.lifeCycleLog = {};
  }

  logLifecycle (e) {
    let componentId = getComponentId(e.sender),
      eventIndex,
      evtDetail,
      componentNextState = {},
      meta = this.lifeCycleLog[componentId];
    if (!meta) {
      meta = { eventStream: [] };
      this.lifeCycleLog[componentId] = meta;
    }
    meta[e.type] = meta[e.type] ? meta[e.type] + 1 : 1;
    /**
     * eventStream is like a list of events that has happened on this component
     * throughout it's lifecycle
    */
   eventIndex = meta.eventStream.push({
      type: e.type,
      timestamp: Date.now(),
      now: new Date(),
      componentId,
      state: componentNextState
    });
    evtDetail = {
      eventId: e.type,
      eventIndex,
      componentId,
      componentNextState
    }
    return evtDetail;
  }

  getEventsSorted(componentId, eventName) {
    if (!!!componentId || !this.lifeCycleLog[componentId]) {
      console.log(`Invalid component ID requested method#getEventsSorted ID#${componentId}`);
    }
    const sortedEvents = this.sortEventStreamASC(this.lifeCycleLog[componentId].eventStream);
    if (eventName) {
      return sortedEvents.filter(evtName => {
        return evtName === eventName;
      });
    }
    return sortedEvents;
  }

  getEventCount(componentId, type) {
    if (!!!componentId || !this.lifeCycleLog[componentId]) {
      console.log(`Invalid component ID requested method#getEventCount ID#${componentId}`);
    }
    if (!!!type || typeof type != "string") {
      console.log(`Invalid eventType#${type} requested method#getEventCount ID#${componentId}`);
    }
    return this.lifeCycleLog[componentId][type] || 0;
  }
  
  sortEventStreamASC(eventStream) {
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
};