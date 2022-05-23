/*
  This lib is old lib must not be used any more
 */
function sendRequest(method, url, { data, headers }, callback) {
  try {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    if (data) {
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    }
    if (headers) {
      Object.entries(headers)
        .forEach(([headerKey, headerValue]) => request.setRequestHeader(headerKey, headerValue));
    }
    request.send(data ? JSON.stringify(data) : null);
    request.onload = function () {
      let res;
      if (request.status !== 200 && request.status !== 304) {
        res = request.responseText ? JSON.parse(request.responseText) : 'Server Error'
        callback(res);
      } else {
        res = JSON.parse(request.responseText);
        if (!res) {
          callback('No response from server');
        } else {
          callback(null, res);
        }
      }
    };
    request.onerror = function (oEvent) {
      callback('Error of code ' + oEvent.target.status);
      console.log('Error of code ' + oEvent.target.status);
    };
  } catch (e) {
    console.error(e);
    callback('Server Communication Error');
  }
}

export function getRequest(url, { headers }, callback) {
  sendRequest('GET', url, { headers }, callback);
}

export function deleteRequest(url, callback) {
  sendRequest('DELETE', url, {}, callback);
}

export function putRequest(url, data, callback) {
  sendRequest('PUT', url, { data }, callback);
}

export function postRequest(url, data, callback) {
  sendRequest('POST', url, { data }, callback);
}

export function initGarage (garage) {
  if (!garage.markToRemove) {
    garage.markToRemove = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.userToAdd) {
    garage.userToAdd = null; // eslint-disable-line no-param-reassign
  }
  if (!garage.AddingUserInProgress) {
    garage.AddingUserInProgress = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.disableUserAdd) {
    garage.disableUserAdd = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.userMarkedToAdd) {
    garage.userMarkedToAdd = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.showUserAddInput) {
    garage.showUserAddInput = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.mustContactAdmin) {
    garage.mustContactAdmin = false; // eslint-disable-line no-param-reassign
  }
  if (!garage.emailUserToAdd) {
    garage.emailUserToAdd = ''; // eslint-disable-line no-param-reassign
  }
  if (!garage.userAddErrorMsg) {
    garage.userAddErrorMsg = ''; // eslint-disable-line no-param-reassign
  }
  if (!garage.collapsable) {
    garage.collapsable = { // eslint-disable-line no-param-reassign
      allUsers: false,
      apvUsers: false,
      vnUsers: false,
      voUsers: false,
      leadUsers: false
    };
  }
  return garage;
};

export function  findById (id, source) {
  if (!id) return null;
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return source[i];
    }
  }
  return null;
};

export function  getId (instance) {
  return instance ? instance.id : null;
};

export function  copyText (id) {
  var range = null;

  if (!id || id.length <= 0) {
    console.error('[gsTools.copyText] Invalid Argument --> id <--');
    return false;
  }
  try {
    if (document.selection) {
      range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(id));
      range.select();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
      range = document.createRange();
      range.selectNode(document.getElementById(id));
      window.getSelection().addRange(range);
    }
    if (!document.execCommand('copy')) {
      console.error('[gsTools.copyText] Unable To Copy --> document.execCommand() <--');
    }
  } catch (e) {
    console.error('[gsTools.copyText] Unable To Copy --> Unknown Error <--');
  }
  return true;
};
