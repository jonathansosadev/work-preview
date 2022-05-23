const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function _getFiles(dir, filter) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? _getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []).filter((f) => (filter ? f.indexOf(filter) >= 0 : true));
}

const main = async (frontendDir) => {
  const files = await _getFiles(frontendDir, '.vue');
  let updates = 0;
  files.forEach((f) => {
    try {
      const source = fs.readFileSync(f, 'utf8');
      if (source.indexOf('<i18n') >= 0) {
        let modified = source.replace(/\s*<i18n[\s\S]+i18n>\s*/, ''); // single or multi line with closing tag
        modified = modified.replace(/\s*<i18n.+\/>\s*/, ''); // inline
        if (modified.length !== source.length) {
          fs.writeFileSync(f, modified);
          updates++;
        } else {
          console.error('Something wrong on ' + f);
        }
      }
    } catch (e) {
      console.error(f, e.message);
    }
  });
  console.log(updates + ' files updated');
};
const frontendDir = path.resolve(path.join(__dirname), '../../..', 'frontend');
main(frontendDir, process.argv[2]);
