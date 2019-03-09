// start connection in content script
let contentPort = chrome.runtime.connect({
  name: 'background-content'
});
//Append your pageScript.js to "real" webpage. So will it can full access to webpate.
var s = document.createElement('script');
s.src = chrome.extension.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(s);
//Our pageScript.js only add listener to window object, 
//so we don't need it after it finish its job. But depend your case, 
//you may want to keep it.
// s.parentNode.removeChild(s);

//Listen for runtime message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('inside contentscript chrome.runtime.onMessage.', message);
  if (message.action === 'GET_CHARTS') {
     //fire an event to get duck
     console.log('dispatcing events',message);
     let event = new CustomEvent('GET_CHARTS');
     window.dispatchEvent(event);
     return true;
  }
  else if(message.action.includes('GET_CHARTS')) {
     //fire an event to get duck
     console.log('dispatcing events',message);
     let event = new CustomEvent('GET_CHARTS',{
        detail: {
          id: message.action.replace('GET_CHARTS_','')
        }
      });
     window.dispatchEvent(event);
     return true;
  }
});

window.addEventListener('message', function receiveChart(event) {
  console.log('inside contentscript window.', event);
  if(event.data.action === 'GOT_CHARTS') {
    console.log('inside contentscript window.', event);
    //Remove this listener, but you can keep it depend on your case
    //  window.removeEventListener('message', receiveDuck, false);
     contentPort.postMessage({type: 'GOT_CHARTS', payload: event.data.payload});
     console.log('receving FusionCharts', event.data.payload);
  }
}, false);
