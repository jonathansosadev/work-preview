
export function promisify(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) { reject(err); return; }
      resolve(result);
    });
  });
}
