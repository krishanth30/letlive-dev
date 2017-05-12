function getCurrentTabUrl(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function(tabs) {
		var tab = tabs[0];
		callback(tab.url);
	});
}

var site;
jQuery(document).ready(function() {
	var callback = function(url) {
		site = url;
		
		if(site != null && site != undefined && site != "" && site.indexOf("chrome://") == -1) {
			site = extractName(site);
			
			chrome.storage.sync.get(site, function(obj) {
				if(obj != undefined && obj[site] != undefined && obj[site].active == 1) {
					document.getElementById("mark").src = "on.png";
					jQuery('#time')[0].value = obj[site].mins;
				}
				else if(obj[site] != undefined && obj[site] != null && obj[site].active == 0) {
					document.getElementById("mark").src = "off.png";
					if(obj[site].mins != undefined) {
						jQuery('#time')[0].value = obj[site].mins;
					}
				}
				else {
					document.getElementById("mark").src = "off.png";
				}
			});
		}
		else {
			document.getElementById("mark").src = "off.png";
		}
	}
	
	getCurrentTabUrl(callback);
	var errorpanel = jQuery("#message");
	jQuery(errorpanel).hide();
	
	$(document).ready(function() {
		$("#time").keydown(function (e) {
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
				(e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
				(e.keyCode >= 35 && e.keyCode <= 40)) {
					 return;
			}
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});
	});
	
	document.getElementById('mark').addEventListener("click", function(e) {		
		if(site != null && site != undefined && site != "" && site.indexOf("chrome://") == -1) {
			jQuery(errorpanel).hide();
			var elem = e.target;
			var mins = jQuery('#time').val();
							
			if(elem.src.indexOf("on.png") != -1)
			{
				markInActive(mins);
				elem.src = "off.png";
			}
			else if(elem.src.indexOf("off.png") != -1) {
				if(isNaN(mins) || mins < 1 || mins > 1440) {
					jQuery(errorpanel)
						.text("Minutes should be a whole number between 1 and 1440.")
						.show();
				}
				else {
					markActive(mins);
					elem.src = "on.png";
				}
			}			
		}
		else {
			jQuery(errorpanel)
				.text("Cannot be set. Invalid url.")
				.show();
		}
	});
});

function markActive(mins) {
	if(site != undefined && site != "") {
		jQuery("#message").hide();
		
		var data = {};
		data[site] = {};
		data[site]["active"] = 1;
		data[site]["mins"] = mins;
		chrome.storage.sync.set(data);
		
		chrome.tabs.query({
			active : true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				message : "mark_active"
			});
		});
	}
	else {
		jQuery("#message")
			.text("Unable to mark active.")
			.show();
	}
}

function markInActive(mins) {
	if(site != undefined && site != "") {
		jQuery("#message").hide();
		
		var data = {};
		data[site] = {};
		data[site]["active"] = 0;
		data[site]["mins"] = mins;
		chrome.storage.sync.set(data);
		
		chrome.tabs.query({
			active : true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				message : "mark_inactive"
			});
		});
	}
	else {
		jQuery("#message")
			.text("Unable to mark inactive.")
			.show();
	}
}

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
