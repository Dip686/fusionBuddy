import { HIGHLIGHT_COMPONENT } from '../../utilities/constants';
import { getComponentFromChart, highlightHTMLElement, removeExistingHighlights } from '../../utilities/utils';

export default class Highlighter {
  constructor() {
  }
  enableListeners(platform) {
    platform.addEventListener(HIGHLIGHT_COMPONENT, onHighlightComponentById);
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
        const element = getDOMElementFromGraphicalElement(graphicalElements[prop]);
        if (element) {
          highlightHTMLElement(element.getClientRects()[0]);
        }
      }
    }
  }
}

function getDOMElementFromGraphicalElement(element) {
  if (element) {
    if (element[0] && element[0].getClientRects) {
      return element[0];
    } else if (element.elemStore && element.elemStore[0][0] && element.elemStore[0][0].getClientRects) {
      return element.elemStore[0][0];
    }
  }
  return null;
}