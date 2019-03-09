//background script is always running unless extension
//is disabled

//Wait for some one connect to it
let contentPort, activeTab, chartInfo, panelPort;
chrome.runtime.onConnect.addListener(function(portFrom) {
   if(portFrom.name === 'background-content') {
     console.log('background-content', portFrom);
     contentPort = portFrom;
     contentPort.onMessage.addListener(function(message) {
        console.log('receieved', message);
        chartInfo = message.payload;
        console.log(panelPort);
        if (message.type ==="GOT_CHARTS") {
          panelPort.postMessage({type: 'GOT_CHARTS', payload: chartInfo});
        }
      });
    }else if (portFrom.name === 'panel-commn') {
      console.log('panel-commn', portFrom);
      panelPort = portFrom;
      panelPort.onMessage.addListener(function(message) {
        if (message.type === "GET_UPDATED_DATA") {
          let componentId = message.payload.componentId;
          chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            console.log('activetab', tab);
            activeTab = tab[0].id;
            chrome.tabs.sendMessage(activeTab,{action: `GET_CHARTS_${componentId}`});
          });
        } else if (message.type === "GET_CHARTS"){
          chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            console.log('activetab', tab);
            activeTab = tab[0].id;
            chrome.tabs.sendMessage(activeTab,{action: `GET_CHARTS`});
          });
        }
      });
    }
});

// chrome.extension.onConnect.addListener(function (port) {
//   console.log('inside background chrome.extension.onConnect');
//     chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
//     console.log('activetab', tab);
//     activeTab = tab[0].id;
//     // chrome.tabs.sendMessage(activeTab,{action: 'GET_CHARTS'});
//   });
// });
