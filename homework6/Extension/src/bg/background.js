var showSummary = true;

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('http://courses.ischool.berkeley.edu/i290ta') > -1) {
    // Show/Hide summary
    toggleSummary(tab, showSummary);

    // Show icon
    chrome.pageAction.show(tabId);
  }
}

function toggleSummary(tab, setState) {
	// Determine summary state
	showSummary = typeof setState != "undefined" ? setState : !showSummary;

	// Send request to content_script
	chrome.tabs.sendRequest(tab.id, {show: showSummary}, function() {});
	
	// Change icon
	var path = "icons/icon-19-" + (showSummary ? "on" : "off") + ".png";
	chrome.pageAction.setIcon({tabId: tab.id, path: path});
}


// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(toggleSummary);
