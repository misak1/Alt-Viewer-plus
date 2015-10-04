var logging = true;

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id, {file:'check.js'}, function () {

        var blacklist = getItem("blacklist");
        var nofollow = getItem("noFollow");
        checkType = getItem("checkType");
        var cacheType = getItem("cache");
        var optionsURL = chrome.extension.getURL("options.html");

        chrome.tabs.sendMessage(tab.id, {bl:blacklist, ct:checkType, ca:cacheType, op:optionsURL, nf:nofollow});
    });
});

function onRequest(request, sender, callback) {
    if (request.action == "check") {
        if (request.url) {
            if (getItem("cache")=='true'){
                indexedDBHelper.getLink(request.url).then(function(link){
                    if(typeof(link) != "undefined" && (200 <= link.status && link.status < 400)){
                        log("found");
                        log(link);
                        return callback(link.status);
                    }
                    else{
                        check(request.url, callback);
                        log("not in db");
                        log(request.url);
                        log("added");
                    }
                }, function(err){
                    log(err);
                });
            }
            else{
                // do not use cache
                check(request.url, callback);
            }
        }
    }
    return true;
}

// Timeout for each link is 60+1 seconds
var timeout = 30000;

function check(url, callback) {
    var XMLHttpTimeout = null;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            log(xhr);
            clearTimeout(XMLHttpTimeout);
            return callback(xhr.status);
        }
    };

    try {
      xhr.open(getItem("checkType"), url, true);
      xhr.send();
    }
    catch(e){
      console.log(e);
    }

    XMLHttpTimeout=setTimeout(function (){return callback(408); xhr.abort();}, timeout += 1000);
}

// OPTIONS: Management

// OPTIONS: Set items in localstore
function setItem(key, value) {
    try {
      log("Inside setItem:" + key + ":" + value);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    }catch(e) {
      log("Error inside setItem");
      log(e);
    }
    log("Return from setItem" + key + ":" +  value);
}

// OPTIONS: Get items from localstore
function getItem(key) {
    var value;
    log('Get Item:' + key);
    try {
      value = window.localStorage.getItem(key);
    }catch(e) {
      log("Error inside getItem() for key:" + key);
      log(e);
      value = "null";
    }
    log("Returning value: " + value);
    return value;
}

// OPTIONS: Zap all items in localstore
function clearStrg() {
    log('about to clear local storage');
    window.localStorage.clear();
    log('cleared');
}

function log(txt) {
    if(logging) {
      console.log(txt);
    }
}