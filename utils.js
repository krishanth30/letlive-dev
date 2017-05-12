function extractName(url) {
    var hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];

    return hostname.replace( new RegExp("[.]", 'g'), "");
}

var site = extractName(location.href);
var threadID;

window.addEventListener("load", function() {
	if(site != undefined) {
		chrome.storage.sync.get(site, function(obj) {
			if(obj != undefined && obj[site] != undefined && obj[site].active != undefined && obj[site].active == "1" && obj[site].mins != undefined) {
				createActiveThread(obj[site].mins);
			}
		});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == "mark_active") {
		if(site != undefined) {
			chrome.storage.sync.get(site, function(obj) {
				if(obj != undefined && obj[site] != undefined && obj[site].mins != undefined) {
					createActiveThread(obj[site].mins);
				}
			});
		}
	}
	else if (request.message == "mark_inactive") {
		deleteThread();
	}
});

function deleteThread() {
	if(threadID) {
		clearInterval(threadID);
	}
}

function createActiveThread(mins) {
	var hitServer = function () {
		httpGet(location.origin);
	}
	threadID = setInterval(hitServer, mins * 60 * 1000);
}

function httpGet(theUrl) {
    $.ajax({
		type: 'GET',
		url: theUrl
	});
}