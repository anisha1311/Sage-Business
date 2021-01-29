import amqp from 'amqplib';
import logger from '../../shared/logger';
import app from 'src/server';
import { Constant } from '@shared/constants';

export class QueueSenderConnector {
    private static connUrl: string =String(process.env.SENDER_QUE_CON_URL)
    private static opt: any = { credentials: amqp.credentials.plain(String(process.env.SENDER_QUE_USERNAME), String(process.env.SENDER_QUE_PSWRD)) };
    private static async createConnection() {
        try {
            const conn = await amqp.connect(this.connUrl, this.opt);
            return await conn.createChannel();
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
    public static async getQueueConnection(): Promise<amqp.Channel> {
        try {
            // check connection if exist in global variable
            let ch = app.get(Constant.commanConst.rabbitMQSenderConn);
            // If not exist then Get chhanel connection
            if (!ch) {
                ch = await this.createConnection();
                app.set(Constant.commanConst.rabbitMQSenderConn, ch);
            }
            return ch;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}