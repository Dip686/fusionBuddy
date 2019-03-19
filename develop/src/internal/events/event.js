import { GET_LIFE_CYCLE_LOG, GOT_EVENTS, GOT_LIFE_CYCLE_LOG } from '../../utilities/constants';
import { postWindowMessage } from "../../utilities/utils";
import Store from '../store';


export default class Event {
  constructor () {
    this.store = new Store();
  }
  enableListeners (platform) {
    platform.addEventListener(GET_LIFE_CYCLE_LOG, getEventDetails.bind(this));
    FusionCharts.addEventListener('*', registerEventLogs.bind(this));
  }
  disableListeners (platform) {
    platform.removeEventListener(GET_LIFE_CYCLE_LOG, registerEventLogs);
  }
}
function registerEventLogs(e) {
  const registeredEvent = this.store.logLifecycle(e);
  postWindowMessage(GOT_EVENTS, registeredEvent);
}
function getEventDetails (e) {
  const componentId = e.detail.id,
    lifeCycleObj = this.store.lifeCycleLog[componentId];
  postWindowMessage(GOT_LIFE_CYCLE_LOG, lifeCycleObj);
}