const debug = require('debug')('garagescore:server:boot:serve-static-files'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:serve-static-files');
const publisher = require('../../common/lib/garagescore/garage/directory-publisher');

debugPerfs('Starting boot sitemap');
module.exports = function wwwSitemap(app) {
  app.use('/sitemap.xml', async (req, res) => {
    const sitemap = [
      process.env.WWW_URL,
      'https://www.custeed.com/jobs/',
      `${process.env.WWW_URL}/fr_FR/siteindex`,
      `${process.env.WWW_URL}/es_ES/siteindex`,
    ];

    let html =
      '<?xml version="1.0" encoding="UTF-8"?>\n <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urls = await publisher.getSitemapURLs();
    if (!urls) {
      html += '</urlset>';
      res.setHeader('Content-Type', 'text/xml');
      return res.send(html);
    }
    urls.map((relativeURL) => sitemap.push(`${process.env.WWW_URL}/${relativeURL}`));

    for (let u = 0; u < sitemap.length; u++) {
      html += `\n  <url>\n   <loc>\n    ${sitemap[u]}\n   </loc>\n  </url>\n`;
    }
    html += '</urlset>';
    res.setHeader('Content-Type', 'text/xml');
    res.send(html);
  });
};
