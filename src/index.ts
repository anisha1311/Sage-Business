
import './loadenv'; // Must be the first import
import app from 'src/server';
var serveStatic = require('serve-static')
import logger from '@shared/logger';
import QBAuthRouter from './routes/myob-auth.route';
import {QueueReciverConnector} from './services/queues/queue-receiver-connector.service'
import {QueueSenderConnector} from './services/queues/queue-sender-connector.service'
import { SmaiBusinessService } from 'src/services/myob-operations/smai.service';
import "reflect-metadata";

let smaiBusinessService = new SmaiBusinessService;
// Get queue receiver connection and set it global and start listener
QueueReciverConnector.getQueueConnection().then(() => {
    logger.info('Webhook Queue listener started.');
}).catch((err: any) => {
    logger.info('Error occured while Webhook Queue Listening.');
    process.exit();
})
// Get queue sender connection and set it global
QueueSenderConnector.getQueueConnection().then((con: any) => {
    logger.info('Webhook Queue sender started.');
}).catch((err: any) => {
    logger.info('Error occured while creating queue sender connection.');
    process.exit();
})



const port = Number(process.env.PORT || 3001);
logger.info('port ' + port)

let server = app.listen(port, () => { 
 //   smaiBusinessService.saveBusiness('m-ZG!IAAAAIhp1JEdP2o-VkZiYYiznan3Y-5GxkRrgOluK-U5W2R4AQEAAAFC5U2YzWPXKxdim4xLGoJdXhxNsqvdLgUfPq_vDwJczYOf3rwxsmnU1N4DFo5ENmxIGBtcqjwLQZpabxQOiTg_HA6G3r0otzix9sJnFLoSRtuGb00uVxS83cfwOAUJ8qteQYMA6stb1NnO_tI0JjcnoWYrkqRvmytKoy6oXCg4d1Q0rjyoSMLwEACgNE2RQmVZbhqYejYsYYvCkJ1QNKJyFN1c6CdI4lmdPxTB6T56npeoTEVYtk_scmOrgOObvpecEudgOBan8Cgp8C4P1qcwO6uAiIKPfcrI6yTseibTng8jAyBrB3ljD8sY1l50H1HuVOS0OhVXm5SWAy6jjEdF');
    console.log('smai-myob-Service started on port: ' + port);
});