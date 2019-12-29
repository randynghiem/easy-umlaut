// declare status
var active = true;

// handle initial load
chrome.storage.sync.get(["active"], function(result) {
  // set to active by default
  if (typeof result.active == "undefined") {
    result.active = true;
    chrome.storage.sync.set({ active: true });
  }
  active = result.active;
  updateIcon();
});

// update browser icon
function updateIcon() {
  if (active) {
    chrome.browserAction.setIcon({
      path: {
        "16": "img/Easy-Umlaut-logos16.png",
        "32": "img/Easy-Umlaut-logos32.png",
        "48": "img/Easy-Umlaut-logos48.png",
        "128": "img/Easy-Umlaut-logos128.png"
      }
    });
  } else {
    chrome.browserAction.setIcon({
      path: {
        "16": "img/disabled/Easy-Umlaut-logos16.png",
        "32": "img/disabled/Easy-Umlaut-logos32.png",
        "48": "img/disabled/Easy-Umlaut-logos48.png",
        "128": "img/disabled/Easy-Umlaut-logos128.png"
      }
    });
  }
}

// handle clicking on browser icon
chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.sync.get(["active"], function(result) {
    active = !result.active;
    chrome.storage.sync.set({ active: active }, updateIcon);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "EXTENSION_STATUS_UPDATE", active: active },
        function(response) {}
      );
    });
  });
});

// handle incoming message
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  if (req.type == "EXTENSION_STATUS") {
    sendResponse({ active: active });
  }
});
