import { getComponentId } from "../utilities/utils";

export default class {
  constructor() {
    this.lifeCycleLog = {};
    this.eventRegister = {
      eventLog: []
    };
  }

  registerEvents(e) {
    let evtDetail = {};
    if (e.sender) {
      evtDetail = {
        eventId: e.type,
        // reference: e.sender.apiInstance || e.sender,
        referenceId: e.sender.apiInstance ? e.sender.apiInstance.getId ? e.sender.apiInstance.getId() : e.sender.apiInstance.id :
          e.sender ? e.sender.getId ? e.sender.getId() : e.sender.id : {}
      };

      this.eventRegister.eventLog.push(evtDetail);
    }
    return evtDetail;
  }

  logLifecycle(e) {
    const key = getComponentId(e.sender);
    let meta = this.lifeCycleLog[key];
    if (!meta) {
      meta = { eventStream: [] };
      this.lifeCycleLog[key] = meta;
    }
    meta[e.type] = meta[e.type] ? meta[e.type] + 1 : 1;
    /**
     * eventStream is like a list of events that has happened on this component
     * throughout it's lifecycle
    */
    meta.eventStream.push({
      type: e.type,
      timestamp: Date.now(),
      now: new Date()
    });
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

  fetchEventsLog(eventId = 'all', componentId = 'all') {
		let eventLog = this.eventRegister.eventLog;
		if (eventId.toLowerCase() === 'all' && componentId.toLowerCase() === 'all') {
			return eventLog;
		} else if (eventId.toLowerCase() === 'all' && componentId.toLowerCase() !== 'all') {
			return eventLog.filter((event) => {
				return (event.referenceId === componentId);
			});
		} else if (eventId.toLowerCase() !== 'all' && componentId.toLowerCase() === 'all') {
			return eventLog.filter((event) => {
				return (event.eventId === eventId);
			});
		} else {
			return eventLog.filter((event) => {
				return (event.eventId === eventId && event.referenceId === componentId);
			});
		}
	}
};