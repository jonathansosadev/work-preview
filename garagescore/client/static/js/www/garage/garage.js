// goog analytics, track click and load the url
var trackOutboundLink = function (url) {
  var cb = function () { document.location = url; };
  if (ga) {
    ga('send', 'event', 'outbound', 'click', url, {
      'transport': 'beacon',
      'hitCallback': cb
    });
    setTimeout(cb, 800);
  } else {
    cb();
  }
};
var addEvent = function (el, type, handler) {
  if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
};

/** infinite scrolling by https://github.com/alexblack/infinite-scroll/blob/master/infinite-scroll.js*/
var InfiniteScroll = (function () {
  var isIE = /msie/gi.test(navigator.userAgent); // http://pipwerks.com/2011/05/18/sniffing-internet-explorer-via-javascript/
  
  function loadNextComments(scroller) {
    scroller.updateInitiated = true; // eslint-disable-line no-param-reassign
    scroller.options.callback(function (finish) {
      if (finish) {
        scroller.finish();
      } else {
        scroller.updateInitiated = false; // eslint-disable-line no-param-reassign
      }
    });
  }

  InfiniteScroll = function (options) {
    var defaults = {
      callback: function () {},
      distance: 200
    };
    // Populate defaults
    for (var key in defaults) {
      if (typeof(options) === 'undefined' || typeof (options[key]) === 'undefined') {
        options[key] = defaults[key]; // eslint-disable-line no-param-reassign
      }
    }

    var scroller = {
      options: options,
      updateInitiated: false
    };

    var handler = function (event) {
      handleScroll(scroller, event); // eslint-disable-line no-use-before-define
    };

    scroller.finish = function () {
      window.removeEventListener('scroll', handler, false);
      document.removeEventListener('touchmove', handler, false);
    };

    this.end = scroller.finish;
    this.loadNextComments = function () {
      loadNextComments(scroller);
    };
    addEvent(window, 'scroll', handler);
    // window.onscroll = handler;
    // For touch devices, try to detect scrolling by touching
    document.ontouchmove = handler;
  };


  function getScrollPos() {
    // Handle scroll position in case of IE differently
    if (isIE) {
      return document.documentElement.scrollTop;
    }
    return window.pageYOffset;
  }

  var prevScrollPos = getScrollPos();


  // Respond to scroll events
  function handleScroll(scroller) {
    if (scroller.updateInitiated) {
      return;
    }
    var scrollPos = getScrollPos();
    if (scrollPos === prevScrollPos) {
      return; // nothing to do
    }

    // Find the pageHeight and clientHeight(the no. of pixels to scroll to make the scrollbar reach max pos)
    var pageHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;

    // Check if scroll bar position is just 50px above the max, if yes, initiate an update
    if (pageHeight - (scrollPos + clientHeight) < scroller.options.distance) {
      loadNextComments(scroller);
    }

    prevScrollPos = scrollPos;
  }


  return InfiniteScroll;
}());

/** ajax*/
var ajaxGet = function (url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      callback(request.responseText);
    } else {
      console.error(request);
    }
  };

  request.onerror = function () {
    // There was a connection error of some sort
  };

  request.send();
};

var _scroller = null;
var _startPage = parseInt(document.body.getAttribute('data-page'), 10);
var _currentPage = _startPage;

/** end the infinite scroll */
var endScroller = function () {
  if (_scroller === null) { return; }
  _scroller.end();
  _scroller = null;
};
/** start the infinite scroll */
var startScroller = function (type, preloadFirstComs, fromTheStart) {
  if (_scroller !== null) {
    console.error('Cannot start a new scroller');
  }
  /** setup and start infinite scroll*/
  var paginator = document.getElementById('garagescore-garage-directory-paginator-tab');
  if (paginator && paginator.parentNode) paginator.parentNode.removeChild(paginator);
  var showbefore = document.getElementById('garagescore-garage-directory-reviews-showbefore');
  if (showbefore) showbefore.style.display = 'block';
  var commentsPath = window.garagePath + '/comments';

  var noReviewsContainer = {
    all: document.getElementById('garagescore-garage-directory-reviews-container'),
    Maintenance: document.getElementById('garagescore-garage-directory-noreviews-Maintenance-container'),
    NewVehicleSale: document.getElementById('garagescore-garage-directory-noreviews-NewVehicleSale-container'),
    UsedVehicleSale: document.getElementById('garagescore-garage-directory-noreviews-UsedVehicleSale-container')
  };
  var options = {
    distance: 200,
    callback: function (done) {
      if (noReviewsContainer.Maintenance) { noReviewsContainer.Maintenance.style.display = 'none'; }
      if (noReviewsContainer.NewVehicleSale) { noReviewsContainer.Maintenance.style.display = 'none'; }
      if (noReviewsContainer.UsedVehicleSale) { noReviewsContainer.Maintenance.style.display = 'none'; }
      ajaxGet(commentsPath + '/' + type + '/page/' + _currentPage, function (html) {
        if (_currentPage === 1 && !html && noReviewsContainer[type]) {
          noReviewsContainer[type].style.display = 'block';
        } else if (noReviewsContainer.all) {
          noReviewsContainer.all.insertAdjacentHTML('beforeend', html);
          _currentPage++;
        }
        done(html.length === 0);
      });
    }
  };

  // setup infinite scroll
  _scroller = new InfiniteScroll(options); // eslint-disable-line no-new
  if (preloadFirstComs) { // click on a tav
    _currentPage = fromTheStart ? 1 : _startPage;
    _scroller.loadNextComments();
  }
};


/** Add tooltips*/
function changeToolTipDisplay(tooltips, labelcrit, display) {
  for (var i = 0; i < tooltips.length; i++) {
    var tooltip = tooltips[i];
    var crit = tooltip.getAttribute('data-ratingcode');
    if (labelcrit === crit) {
      tooltip.style.display = display;
      break;
    }
  }
}

// toolstips
document.addEventListener('DOMContentLoaded', function () {
  var tooltips = document.getElementsByClassName('garagescore-garage-directory-page-tooltip');
  var labels = document.getElementsByClassName('garagescore-garage-directory-page-review-score-by-item-rating-label');
  var i;
  // category
  for (i = 0; i < labels.length; i++) {
    var label = labels[i];
    var crit = label.getAttribute('data-ratingcode');
    label.addEventListener('mouseover', changeToolTipDisplay.bind(null, tooltips, crit, 'block'), false);
    label.addEventListener('mouseout', changeToolTipDisplay.bind(null, tooltips, crit, 'none'), false);
  }
  for (i = 0; i < tooltips.length; i++) {
    var tooltip = tooltips[i];
    var tid = tooltip.getAttribute('data-tooltip-id');
    document.getElementById('tooltip-close-' + tid)
      .addEventListener('click', function () {this.style.display = 'none';}.bind(tooltip), false);
  }

  // badges
  var trophies = document.getElementsByClassName('garagescore-garage-directory-page-trophy');
  var trophytip = document.getElementById('garagescore-garage-directory-page-tooltip-trophy');
  for (var t = 0; t < trophies.length; t++) {
    trophies[t].addEventListener('mouseover', function () {this.style.display = 'block';}.bind(trophytip), false);
    trophies[t].addEventListener('mouseout', function () {this.style.display = 'none';}.bind(trophytip), false);
  }
   document.getElementById('tooltip-close-garagescore-garage-directory-page-tooltip-trophy')
    .addEventListener('click', function () {this.style.display = 'none';}.bind(trophytip), false);
});

// tabs entretien/neuf/occasion
document.addEventListener('DOMContentLoaded', function () {
  /** some vanilla js */
  var hasClass = function (el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
  };
  var addClass = function (el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += ' ' + className;
  };
  var removeClass = function (el, className) {
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
  };
  var showList = function (className, display) {
    var els = document.getElementsByClassName(className);
    for (var i = 0; i < els.length; i++) {
      els[i].style.display = display || 'block';
    }
  };
  var hideList = function (className) {
    var els = document.getElementsByClassName(className);
    for (var i = 0; i < els.length; i++) {
      els[i].style.display = 'none';
    }
  };
  var removeList = function (className) {
    var els = document.getElementsByClassName(className);
    for (var i = els.length - 1; i >= 0; i--) {
      els[i].parentNode.removeChild(els[i]);
    }
  };

  /** HIDE / SHOW tabs */
  var backgroundImage = document.getElementById('garagescore-garage-directory-page-top-scores');
  var tabMaintenance = document.getElementById('garagescore-garage-tab-maintenance');
  var tabNewVehicleSale = document.getElementById('garagescore-garage-tab-newvehiclesale');
  var tabUsedVehicleSale = document.getElementById('garagescore-garage-tab-usedvehiclesale');
  var buttonMaintenance = document.getElementById('garagescore-garage-button-maintenance');
  var buttonNewVehicleSale = document.getElementById('garagescore-garage-button-newvehiclesale');
  var buttonUsedVehicleSale = document.getElementById('garagescore-garage-button-usedvehiclesale');

  // change bg image
  var changeBackground = function (maintenance, newvehiclesale, usedvehiclesale) {
    if (maintenance) {
      backgroundImage.style.backgroundPosition = 'center top';
    } else if (newvehiclesale) {
      backgroundImage.style.backgroundPosition = 'center center';
    } else if (usedvehiclesale) {
      backgroundImage.style.backgroundPosition = 'center bottom';
    }
  };

  // click on a tab : show scores, reload comments, change img
  var clickTab = function (maintenance, newvehiclesale, usedvehiclesale) {
    var bc = 'garagescore-garage-directory-page-3tabs-button-active';
    var tc = 'garagescore-garage-directory-page-3tabs-tab-active';

    endScroller();
    removeList('garagescore-garage-directory-review');
    changeBackground(maintenance, newvehiclesale, usedvehiclesale);
    if (maintenance) {
      addClass(buttonMaintenance, bc);
      addClass(tabMaintenance, tc);
      startScroller('Maintenance', true, true);
    } else if (buttonMaintenance) {
      removeClass(buttonMaintenance, bc);
      removeClass(tabMaintenance, tc);
    }
    if (newvehiclesale) {
      addClass(buttonNewVehicleSale, bc);
      addClass(tabNewVehicleSale, tc);
      startScroller('NewVehicleSale', true, true);
    } else if (buttonNewVehicleSale) {
      removeClass(buttonNewVehicleSale, bc);
      removeClass(tabNewVehicleSale, tc);
    }
    if (usedvehiclesale) {
      addClass(buttonUsedVehicleSale, bc);
      addClass(tabUsedVehicleSale, tc);
      startScroller('UsedVehicleSale', true, true);
    } else if (buttonUsedVehicleSale) {
      removeClass(buttonUsedVehicleSale, bc);
      removeClass(tabUsedVehicleSale, tc);
    }
  };
  if (buttonMaintenance) { addEvent(buttonMaintenance, 'click', clickTab.bind(null, true, false, false)); }
  if (buttonNewVehicleSale) { addEvent(buttonNewVehicleSale, 'click', clickTab.bind(null, false, true, false)); }
  if (buttonUsedVehicleSale) { addEvent(buttonUsedVehicleSale, 'click', clickTab.bind(null, false, false, true)); }

  /** hide review on load*/
  if (buttonMaintenance) {
    showList('garagescore-garage-directory-review-maintenance');
    // showList('garagescore-garage-directory-review-maintenancefollowup');
    hideList('garagescore-garage-directory-review-newvehiclesale');
    hideList('garagescore-garage-directory-review-usedvehiclesale');
    removeList('garagescore-garage-directory-review');
    startScroller('Maintenance', true);
    changeBackground(true, false, false);
  } else if (buttonNewVehicleSale) {
    hideList('garagescore-garage-directory-review-maintenance');
    // hideList('garagescore-garage-directory-review-maintenancefollowup');
    showList('garagescore-garage-directory-review-newvehiclesale');
    hideList('garagescore-garage-directory-review-usedvehiclesale');
    removeList('garagescore-garage-directory-review');
    startScroller('NewVehicleSale', true);
    changeBackground(true, false, false);
  } else if (buttonUsedVehicleSale) {
    hideList('garagescore-garage-directory-review-maintenance');
    // hideList('garagescore-garage-directory-review-maintenancefollowup');
    hideList('garagescore-garage-directory-review-newvehiclesale');
    showList('garagescore-garage-directory-review-usedvehiclesale');
    removeList('garagescore-garage-directory-review');
    startScroller('UsedVehicleSale', true);
    changeBackground(true, false, false);
  }

  /** show more volume*/
  var mores = document.getElementsByClassName('garagescore-garage-directory-page-review-score-more');
  for (var m = 0; m < mores.length; m++) {
    var type = mores[m].getAttribute('data-type');
    addEvent(mores[m], 'click', function (t, more) {
      showList('garagescore-garage-directory-page-review-score-row-' + t);
      more.style.display = 'none';
    }.bind(null, type, mores[m]));

  };
  /** logos slideshow */
  var runSlide = function (logos) {
      logos[0].style.opacity = 1;
      logos[0].style.display = 'block';
      var currentLogo = 0;
      setInterval(function () {
        for (var i = 0; i < logos.length; i++) {
          logos[i].style.opacity = 0;
          logos[i].style.display = 'none';
        }
        currentLogo = (currentLogo + 1) % logos.length;
        logos[currentLogo].style.opacity = 1;
        logos[currentLogo].style.display = 'block';
      }, 3000);
  }
  var logoslide = document.getElementsByClassName('garagescore-garage-recommendation-garage-logos-slide');
  for (var l = 0; l < logoslide.length; l++) {
    var logos = logoslide[l].getElementsByClassName('garagescore-garage-recommendation-garage-logo');
    if (logos.length === 1) {
      logos[0].style.opacity = 1;
      logos[0].style.display = 'block';
    } else {
      runSlide(logos);
    }
  }  

  // fixed filter on scroll
  if (document.getElementsByClassName('garagescore-garage-directory-page-3tabs-button').length > 1) {
    var threeTabs = document.getElementById('garagescore-garage-directory-page-3tabs-container');
    var tabFixOnScroll = function () {
      var y = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      if (y >= 360) {
        addClass(threeTabs, 'garagescore-garage-directory-page-3tabs-container-fixed');
      } else {
        removeClass(threeTabs, 'garagescore-garage-directory-page-3tabs-container-fixed');
      }
    };
    tabFixOnScroll();
    addEvent(window, 'scroll', tabFixOnScroll);
  }
  
});
