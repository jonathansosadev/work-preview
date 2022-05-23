/** Insert ; and trim
 *
 * Son    Goku   kame    hameha
 * Prince Vegeta final   flash
 * =>
 * Son;Goku;kame;hameha
 * Prince;Vegeta;final;flash
 */

const transform = function transform(options, content) {
  try {
    const lines = content.split('\n');
    const updatedLines = [];
    for (let l = 0; l < lines.length; l++) {
      let line = lines[l];
      const cols = [];
      options.lengths &&
        options.lengths.forEach((length) => {
          cols.push(line.substr(0, length).trim());
          line = line.substr(length);
        });
      updatedLines.push(cols.join(';'));
    }
    return updatedLines.join('\n');
  } catch (e) {
    console.error(e);
    return content;
  }
};
module.exports = {
  transform: transform,
};
