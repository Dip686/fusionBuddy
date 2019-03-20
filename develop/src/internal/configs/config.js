import {GET_CHARTS, GOT_CHARTS } from '../../utilities/constants';
import { postWindowMessage, getComponentTree } from "../../utilities/utils";
import Store from '../store';


export default class Config {
  constructor () {
    this.store = new Store();
  }
  enableListeners (platform) {
    platform.addEventListener(GET_CHARTS, getChartsInPage.bind(this));
  }
  disableListeners (platform) {
    platform.removeEventListener(GET_CHARTS, getChartsInPage);
  }
}
function getChartsInPage (e) {
  const charts = getComponentTree(FusionCharts.items),
  lifeCycleObj = JSON.parse(JSON.stringify(this.store.lifeCycleLog));
  console.log(charts, lifeCycleObj);
  postWindowMessage(GOT_CHARTS, {charts, lifeCycleObj});
}