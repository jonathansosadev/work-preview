/**
 *
 * @param {*} promises array with all promises
 * @param {*} maxConcurrentRequests number promises same time
 * @param {*} countRemaining number promises countRemaining to log progress
 * @returns array of array of object ! like [[{}, {}] ]
 */
const printProgressBar = ({ total, done }) => {
  const SIZE = 50;
  const DOT_PERCENTAGE = 100 / SIZE;
  const percentage = 100 * (done / total);
  const nDots = Math.floor(percentage / DOT_PERCENTAGE);
  const nEmpty = SIZE - nDots;
  const dots = '#'.repeat(nDots);
  const empty = '.'.repeat(nEmpty);

  process.stdout.write(`\r\t[${dots}${empty}] ${Math.floor(percentage)} % (${done}/${total})`);
};

const concurrentpromiseAll = async (promises, maxConcurrentRequests, logProgress = false) => {
  const allPromises = [...promises];
  let results = [];

  const progress = { total: promises.length, done: 0, allDone: false };
  const logProgressBar = () => {
    printProgressBar(progress);
    if (progress.allDone) {
      console.log('Finished !');
      return;
    }
    setTimeout(logProgressBar, 1000);
  };
  if (logProgress) {
    console.log('');
    setTimeout(logProgressBar, 0);
  }
  const recurse = () => {
    const promise = allPromises.shift(); // on prend la prochaine promesse de la liste
    return !promise
      ? results
      : Promise.allSettled([promise()]).then((result) => {
          progress.done++;
          progress.allDone = progress.done === progress.total;
          if (progress.allDone) {
            logProgressBar();
          }
          if (result && result[0]) {
            results = { ...result[0] }; // return results
          }
          // une promesse vient de finir, on lance la suivante;
          return recurse();
        });
  };
  return Promise.all(
    /* on commence en lancant x promesses (en utilisant un faux tableau avec juste length) */
    Array.from({ length: Math.min(allPromises.length, maxConcurrentRequests) }, recurse)
  );
};

module.exports = { concurrentpromiseAll };
