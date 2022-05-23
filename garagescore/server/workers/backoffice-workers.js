const WebSocketServer = require('ws').Server;
const debugPerfs = require('debug')('perfs:server:boot:backoffice-workers');
const debug = require('debug')('garagescore:server:workers:backoffice-workers'); // eslint-disable-line max-len,no-unused-vars

debugPerfs('Starting boot backoffice-workers');

/* Background workers for heavy async processes */

/** A websocket server where client can connect to watch for the status/results of one taks
  Client must connect to /backoffice/watch/taskID
 */

const tasks = {};

const URL_PREFIX = '/backoffice/watch/';

/** emit a message to client listening to a task */
const _emit = (taskId, message) => {
  try {
    const task = tasks[taskId];
    if (task && task.websocket) {
      task.websocket.send(message);
    }
  } catch (e) {
    console.error(e);
  }
};

/** close a websocket associated to a task*/
const _terminate = (taskId) => {
  try {
    const task = tasks[taskId];
    if (task && task.websocket) {
      task.websocket.close();
    }
  } catch (e) {
    console.error(e);
  }
};

/** Send to connected socket a task status */
const emitTaskStatus = (taskId) => {
  const task = tasks[taskId];
  if (!task || !task.status) {
    return;
  }
  const message =
    task.status === 'ko'
      ? { status: task.status, taskId, message: task.error.message }
      : { status: task.status, taskId, details: task.details };
  _emit(taskId, JSON.stringify(message));
};

/** Send to connected socket a ping */
const emitTaskPing = (taskId) => {
  const task = tasks[taskId];
  if (!task) {
    return;
  }
  _emit(taskId, JSON.stringify({ status: 'running', taskId }));
};
const responseServer = (httpserver) => {
  const wss = new WebSocketServer({ server: httpserver });
  wss.on('connection', (ws) => {
    const uri = ws.upgradeReq.url;
    debug('Websocket connection');
    if (uri.indexOf(URL_PREFIX) !== 0) {
      debug(`Websocket connection refused (${uri} != ${URL_PREFIX})`);
      ws.close();
      return;
    }
    const taskId = uri.substr(URL_PREFIX.length);
    if (!tasks[taskId]) {
      debug(`Websocket connection refused (unknown task ${taskId})`);
      ws.close();
      return;
    }
    debug(`Watching ${taskId}`);
    tasks[taskId].websocket = ws;
    ws.on('close', () => {
      debug(`Websocket connection closed (task ${taskId})`);
      delete tasks[taskId];
    });
    // send status if we already have it
    emitTaskStatus(taskId);
  });
  debug('Backoffice websockets listening');
};

/**
Launch a task (an async function with two parameters (emit, done))

First and before task is run, sends a message through res
{status:'starting', taskId: 'xxx', websocket: address}

when done(err, data) is called, sends a message through the websocket
- if err => { status:'ko', taskId: 'xxx', message: err.message }
- else => { status:'ok', details: data }

inbetween emit(msg) can be called
*/
const launch = (res, task) => {
  const taskId = `bo-task-${Math.floor(Math.random() * 1000000)}`;
  tasks[taskId] = {};
  res.setHeader('Cache-Control', 'max-age=no-cache');
  res.send({ status: 'starting', taskId, websocket: `${URL_PREFIX}${taskId}` });
  const pinger = setInterval(() => {
    emitTaskPing(taskId);
  }, 1000 * 10);
  const done = (err, data) => {
    debug(`Websocket process ended (task ${taskId}), will close socket after 5 seconds`);
    clearInterval(pinger);
    if (tasks[taskId]) {
      if (err) {
        tasks[taskId].error = err;
        tasks[taskId].status = 'ko';
      } else {
        tasks[taskId].details = data;
        tasks[taskId].status = 'ok';
      }
    }
    emitTaskStatus(taskId);
    if (tasks[taskId]) {
      setTimeout(() => {
        _terminate(taskId);
      }, 60 * 5000); // we give some time for the front to get the results
    }
  };
  task((message) => {
    _emit(taskId, message);
  }, done);
};

module.exports = { responseServer, launch };
