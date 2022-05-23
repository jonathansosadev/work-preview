/**
 * Return the caller function and line
 */
const stackTrace = require('stack-trace');
function getC(func) {
  return func.caller;
}
// ignoreModule search for a call outside node_modules
// hints (array) search for a call inside a file with a name containing one of the hint
function getCaller(options = { hints: null, ignoreModules: true }) {
  const trace = stackTrace.get(getC(getCaller));
  let caller = trace[0];
  let i = 0;
  for (; i < trace.length; i++) {
    const fn = trace[i].getFileName();
    if (options.ignoreModules && fn && fn.indexOf('node_modules') < 0) {
      continue;
    }
    caller = trace[i]; // if we dont find the hints at least we keep this value
    if (options.hints && fn && options.hints.find((h) => fn && fn.indexOf(h) >= 0)) {
      break;
    }
  }
  /*return {
        typeName: caller.getTypeName(),
        functionName: caller.getFunctionName(),
        methodName: caller.getMethodName(),
        filePath: caller.getFileName(),
        lineNumber: caller.getLineNumber(),
        topLevelFlag: caller.isToplevel(),
        nativeFlag: caller.isNative(),
        evalFlag: caller.isEval(),
        evalOrigin: caller.getEvalOrigin()
    };
    */
  return `${caller.getFileName()}:${caller.getLineNumber()}`;
}
module.exports = { getCaller };
