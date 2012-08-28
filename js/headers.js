// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var tabId = parseInt(window.location.search.substring(1));

window.addEventListener("load", function() {
  chrome.debugger.sendCommand({tabId:tabId}, "Network.enable");
  chrome.debugger.onEvent.addListener(onEvent);
});

window.addEventListener("unload", function() {
  chrome.debugger.detach({tabId:tabId});
});

var requests = {};

function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId)
    return;

  if (message == "Network.requestWillBeSent") {
    var requestDiv = requests[params.requestId];
    
    if (!requestDiv) {
      var requestDiv = document.createElement("div");
      requestDiv.className = "request";
      requests[params.requestId] = requestDiv;
      var urlLine = document.createElement("div");
      urlLine.textContent = params.request.url;
      requestDiv.appendChild(urlLine);
    }
    
    /*

    if (params.redirectResponse)
      appendResponse(params.requestId, params.redirectResponse);

    var requestLine = document.createElement("div");
    requestLine.textContent = "\n" + params.request.method + " " +
        parseURL(params.request.url).path + " HTTP/1.1";
    requestDiv.appendChild(requestLine);
    document.getElementById("container").appendChild(requestDiv);
    */
    
    domain = parseURL(params.request.url).host;
    if(domain.indexOf("appspot.com")) {
		
		$.getJSON(params.request.url, function(data) {
			if( data.hasOwnProperty("quiz") ){
				
				$('#intro').hide();
				$('.prev-category').html('Previous: ' + $('.category').html());
				$('.category').html( data['quiz']['genreName'] );
				$('.answers li').appendTo('.prev-answers');
				$(data['quiz']['questions']).each( function(){
					var question = this,
					answerIndex = question['answerIndex'],
					answer = question['songs'][answerIndex];

					$listItem = $('<li></li>');
					$listItem.html(answer['artist'] + " - " + answer['title']);
					_gaq.push(['_trackEvent', 'Answers', 'Is', answer['artist'] + " - " + answer['title']]);
					$('.answers').append($listItem);
					});
				};
				// Track when a list of answers is created
				_gaq.push(['_trackEvent', 'Answers', 'Loaded']);
			});
		};

	}
}

function parseURL(url) {
  var result = {};
  var match = url.match(
      /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;
  result.scheme = match[1].toLowerCase();
  result.host = match[2];
  result.port = match[3];
  result.path = match[4] || "/";
  result.fragment = match[5];
  return result;
}

/*
	Google Analytics for tracking use
	More infomation: https://developer.chrome.com/trunk/extensions/tut_analytics.html
	If you want access to the data just send me a message!
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-34374614-1']);
_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();