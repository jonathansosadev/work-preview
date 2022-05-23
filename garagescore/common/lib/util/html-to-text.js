/**
 * This function is used to convert html email to text
 * Here are the things modified :
 * - Delete top "two-column" used to display brand image
 * - Delete style tag + content
 * - Replace every <p>, </p> and <br> to new line ('\n')
 * - Get the http links outside <a> tag just for unsubscribe_url, mailto and take ONLY the FIRST link (Rating link)
 * - Delete every <a> + content
 * - Delete every remaining tags
 **/

module.exports = {
  htmlToText(html) {
    return html
      .replace(/\s+/g, ' ')
      .replace(/<td class="two-column"([\s\S]+?)<\/td>/g, '')
      .replace(/<style([\s\S]+?)<\/style>/g, '')
      .replace(/<p[^>]+>/g, '\n')
      .replace(/<\/p>/g, '\n')
      .replace('<a href="%tag_unsubscribe_url%"', '%tag_unsubscribe_url%<a')
      .replace('<a href="mailto:commerce@garagescore.com"', 'commerce@garagescore.com<a')
      .replace('<a href="mailto:commerce@custeed.com"', 'commerce@custeed.com<a')
      .replace(/<a[^>]+href="([^"]+)[^>]+>/, '$1<a>')
      .replace(/<a([\s\S]+?)<\/a>/g, '')
      .replace(/<br>/g, '\n')
      .replace(/<[^>]+>/g, ' ');
  },
};
