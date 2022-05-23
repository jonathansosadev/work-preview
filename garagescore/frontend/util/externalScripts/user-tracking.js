import scriptLoader from './script-loader';

export default (publicAPIUrl, userId) => {
/**
 * We send to our server the timespent on a page:
 * - every 30s
 * - every time we navigate
 */
  scriptLoader("/tracking/user-tracking.js", false, {
    onScriptLoaded: () => {
      /** Capture all events */
  (() => {
    let clickbuffer = null;
    document.querySelector('body').addEventListener('click', event => {
      if (event.target && event.target.getAttribute("track-id")) {
        const tId = event.target.getAttribute("track-id");
        if (clickbuffer) { clearTimeout(clickbuffer) };
          clickbuffer = setTimeout(() => {
            clickedElements[tId] = clickedElements[tId] ? clickedElements[tId] + 1 : 1;
          }, 1000);
        }
    }, true);

  }).call(this);
      const currentPage = () => {
        let path = window.location.pathname;
        path = path.replace(/[0-9a-f]{24}/, '[oid]');
        return path;
      }
      let clickedElements = {};
      // save time spent on our server
      const sendTimeSpent = () => {
        const timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
        if (timeSpentOnPage) {
          const event = 'TIME_SPENT_ON_PAGE';
          const key1 = encodeURIComponent(currentPage());
          const key2 = userId;
          const xmlhttp=new XMLHttpRequest();
          xmlhttp.open("POST", `${publicAPIUrl}/events/add/${event}/1/${key1}/${key2}?time=${timeSpentOnPage}`, true);
          xmlhttp.send();
        TimeMe.setCurrentPageName(currentPage());
        TimeMe.resetAllRecordedPageTimes();
        TimeMe.startTimer();
        }
      };


      // save clicks on our server
      const sendClicks = () => {
        if (Object.keys(clickedElements).length) {
          const event = 'CLICKS';
          const key1 = encodeURIComponent(currentPage());
          const key2 = userId;
          const xmlhttp = new XMLHttpRequest();
          const counters = Object.keys(clickedElements).map(e=> `${e}=${clickedElements[e]}`)
          xmlhttp.open("POST", `${publicAPIUrl}/events/add/${event}/1/${key1}/${key2}?${counters.join("&")}`, true);
          xmlhttp.send();
          clickedElements = {};
        }
      };
      TimeMe.initialize({
        currentPageName: currentPage(), // current page
        idleTimeoutInSeconds: 30, // seconds
      });

    /**  Send stats when our url change, this global function must be called manually */
      window.userTracking = {
        pageView: () => {
          sendTimeSpent();
        }
      };
    /** Send time stats every 30s */
     let lastTSOP = -1;
     setInterval(function(){
			const timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
       if (lastTSOP !== timeSpentOnPage) {
         lastTSOP = timeSpentOnPage;
         return;
       }
       if (timeSpentOnPage > 0) {
         sendTimeSpent();
       }
		}, 30*1000);
    /** Send clicks every 5s */
     setInterval(function(){
       sendClicks();
		}, 5*1000);


  }, async: true });
};
