const v8 = require('v8');
const { TIBO, log } = require('../../util/log');

// Format an int to the form of "512 MB" or "2 GB"
function formattedHeapSizeLimit(heapSizeLimit) {
  const heapSizeLimitInMb = (heapSizeLimit / 1024 / 1024).toFixed(2);

  return heapSizeLimitInMb >= 1024 ? `${(heapSizeLimitInMb / 1024).toFixed(2)} GB` : `${heapSizeLimitInMb} MB`;
}

// Get heap information in V8 and print it
function printFormattedHeapSizeLimit() {
  const { heap_size_limit: heapSizeLimit } = v8.getHeapStatistics();

  log.warning(TIBO, `[V8 - HEAP SIZE INFO] - Absolute Heap Size Limit Is ${formattedHeapSizeLimit(heapSizeLimit)}`);
}

module.exports = { printFormattedHeapSizeLimit };
