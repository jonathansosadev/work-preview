// a little helper to convert function with callback(err,data) to promise
// be careful, if your original function use `this`, it could be lost
const makeAsync = (fct) => async (...args) =>
  new Promise((resolve, reject) => {
    fct(...args, (err, ...data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(...data);
    });
  });
// like 'makeAsync' but when we need `this`
const makeAsyncPrototype = (object, methodName) => async (...args) =>
  new Promise((resolve, reject) => {
    object[methodName].call(object, ...args, (err, ...data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(...data);
    });
  });
// make a function async and call it
const wait = (fct, ...args) => makeAsync(fct)(...args);
module.exports = {
  makeAsync,
  makeAsyncPrototype,
  wait,
};
