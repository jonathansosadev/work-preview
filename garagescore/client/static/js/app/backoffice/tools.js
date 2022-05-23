var gsTools = {};

var reportConfigs = [
  { label: 'journalier', id: 'daily' },
  { label: 'hebdomadaire', id: 'weekly' },
  { label: 'mensuel', id: 'monthly' }
];

function getReportDefaultConfig() {
  return {
    enable: false,
    generalVue: false,
    lead: false,
    leadVn: false,
    leadVo: false,
    unsatisfiedApv: false,
    unsatisfiedVn: false,
    unsatisfiedVo: false
  };
}

gsTools.getErrorMsg = function (code) {
  switch (code) {
    case 1212: return 'Cet email est déjà utilisé par un autre utilisateur GarageScore ' +
      '<span style="color: #219ab5" class="clickable">Cliquer pour contacter votre administrateur</span>';
    case 1213: return 'L\'email est obligatoire';
    case 1214: return 'L\'email est invalide';
    case 1215: case 1216: return 'Numéro invalide';
    default : return 'Erreur inconnu';
  }
};

gsTools.civilities = [
  {
    id: '',
    value: '-'
  },
  {
    id: 'M',
    value: 'Monsieur'
  },
  {
    id: 'Mme',
    value: 'Madame'
  },
  {
    id: 'Mlle',
    value: 'Mademoiselle'
  }
];

gsTools.validatePostCode = function (code) {
  if (!code) {
    return false;
  }
  return code.match(/^[0-9]{5}$/);
};

gsTools.validateEmail = function (email) {
  if (!email) {
    return false;
  }
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;// eslint-disable-line no-useless-escape,max-len
  return re.test(email.replace(/\s/g, ''));
};

gsTools.isGarageScoreUser = function (user) {
  return user.email.match(/@garagescore|@custeed/);
};
gsTools.getQueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var queryString = {};
  var query = window.location.hash.replace(/^[^?]*\?/, '');
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    // If first entry with this name
    if (typeof queryString[pair[0]] === 'undefined') {
      queryString[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof queryString[pair[0]] === 'string') {
      var arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
      queryString[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      queryString[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return queryString;
};
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

gsTools.getRequest = function (url, { headers }, callback) {
  sendRequest('GET', url, { headers }, callback);
};

gsTools.deleteRequest = function (url, callback) {
  sendRequest('DELETE', url, {}, callback);
};

gsTools.putRequest = function (url, data, callback) {
  sendRequest('PUT', url, { data }, callback);
};

gsTools.postRequest = function (url, data, callback) {
  sendRequest('POST', url, { data }, callback);
};

gsTools.getId = function (instance) {
  return instance ? instance.id : null;
};

gsTools.findById = function (id, source) {
  if (!id) return null;
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return source[i];
    }
  }
  return null;
};


gsTools.displayUser = function (user) {
  if (user.firstName && user.lastName) {
    return user.firstName + ' ' + user.lastName;
  }
  return user.email;
};

gsTools.garage = {};

gsTools.garage.display = function (garage) {
  return garage.publicDisplayName;
};

gsTools.garage.preAssociateUser = function (garage, callback) {
  if (!garage.countAllSubscribedUsers || !garage.usersQuota || garage.countAllSubscribedUsers < garage.usersQuota) {
    callback();
    return;
  }
  Vue.prototype.$modalConfirm.open( // eslint-disable-line no-undef
    '<p>Cet accès supplémentaire dépasse le quota inclus, il sera facturé en supplément (voir conditions tarifaires)</p>' +
    '<p>Confirmez-vous l\'ajout ?</p>', function (value) {
    if (value) {
      callback();
    } else {
      callback('user refused');
    }
  });
};


gsTools.initUser = function (user) {
  var defaultUser = {
    id: '',
    email: '',
    alerts: [],
    reportConfigs: {},
    parentId: '',
    civility: '',
    lastName: '',
    firstName: '',
    phone: '',
    mobilePhone: '',
    address: '',
    postCode: '',
    city: '',
    businessName: '',
    job: '',
    fax: '',
    backoffice: {
      tabs: []
    },
    allGaragesAlerts: {},
    garageIds: [],
    hasAllGarages: false,
    markedToRemove: false,
    markedToDissociate: false,
    markedToResetPassword: false
  };
  var result = _.merge(defaultUser, user); // eslint-disable-line no-undef
  reportConfigs.forEach(function (config) {
    if (!result.reportConfigs[config.id]) {
      result.reportConfigs[config.id] = getReportDefaultConfig(); // eslint-disable-line no-param-reassign
    }
  });
  return result;
};

gsTools.initGarage = function (garage) {
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

/*
** Copy the text inside a DOM elemnt and put it into the clipboard,
** Allowing you / the user to paste it wherever you please.
** ---------------------------
** Usage: gsTools.copyText(id)
** Where 'id' is a String representing the id of
** the DOM element containing the text.
** Example: <div id="foo">Hello World</div> // gsTools.copyText('foo')
** Return: true if the operation was successful, false otherwise
*/
gsTools.copyText = function (id) {
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
