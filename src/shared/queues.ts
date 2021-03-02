import { MQueueData } from '@entities/mqData.entity';
import { QueueSenderConnector } from 'src/services/queues/queue-sender-connector.service'
import { Constant } from './constants';

export class QueueHandler {

    /**
     * Send Message to queue
     * @param queueName 
     * @param message 
     */
    static async sendMessage(queueName?: string, message?: MQueueData) {
        if (queueName === undefined || message === undefined) {
            throw new Error(Constant.commanConst.emptyQueueName)
        }
        // Get chhanel connection if not exist
        let ch = await QueueSenderConnector.getQueueConnection();
        ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{persistent: true});
      //  console.info(" [x] Sent %s", queueName + " BusinessId:- " + message.metadata.businessId);

    }

}