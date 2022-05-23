/** Generate pairs of appId/appSecret*/
const s4 = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const r = () => charset.charAt(Math.floor(Math.random() * charset.length));
const r4 = () => `${r()}${r()}${r()}${r()}`;

const pair = () => {
  const appId = `${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}`;
  const appSecret = `${r4()}${r4()}${r4()}${r4()}${r4()}${r4()}${r4()}${r4()}`;
  return { appId, appSecret };
};

module.exports = pair;
