//background script is always running unless extension
//is disabled

//Wait for some one connect to it
var ports = {};
// let contentPort, activeTab, panelPort;
chrome.runtime.onConnect.addListener(function (port) {
  try {
    var tab = null;
    var name = null;
    if (isNumeric(port.name)) {
      tab = port.name;
      name = 'devtools';
      // installContentScript(+port.name);
      console.log('Devtools connected');
    } else {
      tab = port.sender.tab.id;
      name = 'content-script';
      console.log('Content script connected');
    }

    if (!ports[tab]) {
      ports[tab] = {
        devtools: null,
        'content-script': null,
      };
    }
    ports[tab][name] = port;

    if (ports[tab].devtools && ports[tab]['content-script']) {
      doublePipe(ports[tab].devtools, ports[tab]['content-script']);
    }
  } catch(e){
    // suppressing errors
  }
});

function doublePipe(one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    // console.log('dv -> rep', message);
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    // console.log('rep -> dv', message);
    one.postMessage(message);
  }
  function shutdown() {
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  // one.onDisconnect.addListener(shutdown);
  // two.onDisconnect.addListener(shutdown);
}

function isNumeric(str) {
  return +str + '' === str;
}

function postMessageToPanel(message) {
  if (panelPort) {
    panelPort.postMessage(message);
  }
}

chrome.runtime.onMessage.addListener((req, sender) => {
  setIcon(req.enableFB, sender.tab.id);
});

function setIcon(enableFB, tabId) {
  chrome.browserAction.setIcon({
    tabId: tabId,
    path: {
      '16': enableFB ? '/icons/icon16.png' : '/icons/icon16-disabled.png',
      '48': enableFB ? '/icons/icon48.png' : '/icons/icon48-disabled.png',
      '128': enableFB ? '/icons/icon128.png' : '/icons/icon128-disabled.png',
    },
  });
}