(function() {
  var check, clearStrg, getItem, log, logging, onRequest, setItem, timeout;

  logging = false;

  onRequest = function(request, sender, callback) {
    if (request.action === 'check') {
      if (request.url) {
        if (getItem('cache') === 'true') {
          indexedDBHelper.getLink(request.url).then((function(link) {
            if (typeof link !== 'undefined' && 200 <= link.status && link.status < 400) {
              log('found');
              log(link);
              return callback(link.status);
            } else {
              check(request.url, callback);
              log('not in db');
              log(request.url);
              log('added');
            }
          }), function(err) {
            log(err);
          });
        } else {
          check(request.url, callback);
        }
      }
    }
    return true;
  };

  check = function(url, callback) {
    var XMLHttpTimeout, e, error, xhr;
    XMLHttpTimeout = null;
    xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function(data) {
      if (xhr.readyState === 4) {
        log(xhr);
        clearTimeout(XMLHttpTimeout);
        return callback(xhr.status);
      }
    };
    try {
      xhr.open(getItem('checkType'), url, true);
      xhr.send();
    } catch (error) {
      e = error;
      console.log(e);
    }
    XMLHttpTimeout = setTimeout((function() {
      return callback(408);
      xhr.abort();
    }), timeout += 1000);
  };

  setItem = function(key, value) {
    var e, error;
    try {
      log('Inside setItem:' + key + ':' + value);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    } catch (error) {
      e = error;
      log('Error inside setItem');
      log(e);
    }
    log('Return from setItem' + key + ':' + value);
  };

  getItem = function(key) {
    var e, error, value;
    value = void 0;
    log('Get Item:' + key);
    try {
      value = window.localStorage.getItem(key);
    } catch (error) {
      e = error;
      log('Error inside getItem() for key:' + key);
      log(e);
      value = 'null';
    }
    log('Returning value: ' + value);
    return value;
  };

  clearStrg = function() {
    log('about to clear local storage');
    window.localStorage.clear();
    log('cleared');
  };

  log = function(txt) {
    if (logging) {
      console.log(txt);
    }
  };

  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
      file: 'check.js'
    }, function() {
      var blacklist, cacheType, checkType, nofollow, optionsURL;
      blacklist = getItem('blacklist');
      nofollow = getItem('noFollow');
      checkType = getItem('checkType');
      cacheType = getItem('cache');
      optionsURL = chrome.extension.getURL('options.html');
      chrome.tabs.sendMessage(tab.id, {
        bl: blacklist,
        ct: checkType,
        ca: cacheType,
        op: optionsURL,
        nf: nofollow
      });
    });
  });

  timeout = 30000;

}).call(this);
