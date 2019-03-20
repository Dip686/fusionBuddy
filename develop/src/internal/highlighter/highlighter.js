import { HIGHLIGHT_COMPONENT } from '../../utilities/constants';
import { getComponentFromChart, highlightHTMLElement, removeExistingHighlights } from '../../utilities/utils';

export default class Highlighter {
  constructor() {
  }
  enableListeners(platform) {
    platform.addEventListener(HIGHLIGHT_COMPONENT, onHighlightComponentById.bind(this));
    document.addEventListener('mouseenter', removeExistingHighlights);
  }
  disableListeners(platform) {
    platform.removeEventListener(HIGHLIGHT_COMPONENT, onHighlightComponentById);
    document.removeEventListener('mouseenter', removeExistingHighlights);
  }
}

function onHighlightComponentById(e) {
  const component = getComponentFromChart(e.detail.componentId);
  //Remove old highlights
  removeExistingHighlights();
  if (component) {
    const graphicalElements = component.getGraphicalElement();
    for (let prop in graphicalElements) {
      if (graphicalElements.hasOwnProperty(prop)) {
        const element = graphicalElements[prop];
        highlightHTMLElement(element[0].getClientRects()[0]);
      }
    }
  }
}