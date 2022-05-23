const fs = require('fs-extra');

const NAME = 'CarneEnVara';
const path = '../' + NAME + '.apk';

if (fs.existsSync(path))
    fs.unlinkSync(path);

fs.move('app/build/outputs/apk/release/app-release.apk', path, err => {
  if (err) {
    console.error(err);
    return;
  }

  console.log('El apk se ha generado correctamente');
});