const http = require('http');
const FTP = require('promise-ftp');
const app = require('../../server');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service.js');
const SupervisorMessageTypes = require('../../../common/models/supervisor-message.type');
const monitoringUtils = require('../../../common/lib/garagescore/monitoring/utils');

const ftp = new FTP();

http
  .createServer(async (request, response) => {
    const { method } = request;

    // Registering QUETAL route to test app health
    if (method === 'GET' && request.url === monitoringUtils.routeName) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.writeHead(200);
      response.write(
        JSON.stringify({
          slug: process.env.HEROKU_SLUG_COMMIT || 'Unknown HEROKU_SLUG_COMMIT',
          dbHash: await monitoringUtils.getDataStamp('HTTP2FTP'),
          uptime: monitoringUtils.getUptime(),
        })
      );
      response.end();
      return;
    }

    response.writeHead(200);
    const fileSize = request.headers['content-length'];
    let uploadedBytes = 0;
    let uploadContent = [];

    request.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      uploadContent.push(chunk);
      const p = (uploadedBytes / fileSize) * 100;
      response.write(`Uploading ${parseInt(p, 10)} %\n`);
    });

    request.on('end', async () => {
      uploadContent = Buffer.concat(uploadContent);
      const body = uploadContent.toString();
      if (body.indexOf('####CERTIFIED####') > -1) response.end('File Upload Complete');
      else
        response.end("Hmmm... That request doesn't look like a certified file to me. Did you come just to say hi ? :)");
      if (body.indexOf('####CERTIFIED####') > -1) {
        // test if it's actually a certified file incoming or not
        const ftpLogs = body.slice(0, body.indexOf('\n')).split(' ');
        const ftpLogsBuffer = Buffer.from(body.slice(0, body.indexOf('\n')));
        ftpLogs.shift(); // remove ####CERTIFIED####
        let garageId = null;
        let user = null;
        try {
          user = ftpLogs.shift();
          const password = ftpLogs.shift();
          const fileName = ftpLogs.shift() || 'undefinedName.txt';
          garageId = ftpLogs.shift();
          const contentBuffer = uploadContent.slice(ftpLogsBuffer.length + 1);
          await ftp.connect({ host: 'ftp.garagescore.com', user, password });
          await ftp.put(contentBuffer, fileName);
          await ftp.end();
          await app.models.Garage.findByIdAndUpdateAttributes(garageId, {
            http2ftp: {
              lastUploadDate: new Date(),
              lastFileNameUpload: fileName,
              details: {
                message: `User used is ${user}. The content size is ${contentBuffer.length}`,
              },
            },
          });
        } catch (e) {
          console.error('ERROR FOR USER:', user, 'GarageID:', garageId);
          console.error(e);
          GsSupervisor.warn(
            {
              type: SupervisorMessageTypes.HTTP2FTP_ERROR,
              payload: {
                error: `ERROR ON GARAGE(${garageId}) DETAILS: ${e}`,
                context: 'HTTP2FTP/server.js',
              },
            },
            (eGsSupervisor) => {
              if (eGsSupervisor) console.error('GsSupervisor ERROR:', eGsSupervisor);
            }
          );
        }
      }
      uploadedBytes = 0;
      uploadContent = [];
    });
  })
  .listen(process.env.PORT || 3000, () => {
    console.log(`Server http2ftp started on port ${process.env.PORT || 3000}...`);
  });
