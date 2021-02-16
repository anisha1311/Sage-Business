
import './loadenv'; // Must be the first import
import app from 'src/server';
var serveStatic = require('serve-static')
import logger from '@shared/logger';
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
    console.log('smai-myob-Service started on port: ' + port);
});