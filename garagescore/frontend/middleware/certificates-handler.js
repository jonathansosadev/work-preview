// const tracking = require('../../common/lib/garagescore/tracking/index');

const failedRequests = {};

const certificatesHandlers = async  ({ req, params, store, route, error }) => {
  if (route.name && route.name.indexOf('certificate-slug') === 0) {
    try {
      const noCache = route.query.nocache && (route.query.nocache === '1' || route.query.nocache === 'true');
      const context = await req.app.$CertificateBuilder.BuildContext(params.slug, route, noCache);
      store.state.locale = (context.garage && context.garage.locale && context.garage.locale.slice(0, 2)) || 'fr';
      store.dispatch('certificate/BUILD_CONTEXT', context);
    } catch (e) {
      console.log(e.message.replace('Error:','Warning:'));
      // const ip = tracking.ip(req);
      // failedRequests[ip] = failedRequests[ip] || 0;
      // failedRequests[ip]++;
      // if (failedRequests[ip] % 10 === 0) {
        // console.log(`${failedRequests[ip]} failed requests for ip: ${ip}`);
      // }
      error({ statusCode: 404, message: 'Unable to fetch certificate context'});
    }
  }
}

export default certificatesHandlers