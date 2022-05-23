const Enum = require('../../../lib/util/enum.js');

/**
 * This enum is for the campaign tracking system
 * Each garage can configure a url as such "https://hello-world.com/pixel.png?type={data_type}"
 * Thoses tokens that will be replaced in the url are listed here
 */
module.exports = new Enum({
  DATA_TYPE: '{data_type}',
  RECIPIENT_EMAIL_MD5: '{email_md5}',
  UTM_SOURCE: '{utm_source}',
});
