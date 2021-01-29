import amqp from 'amqplib';
import logger from '../../shared/logger';
import app from 'src/server';
import { Constant } from '@shared/constants';

export class QueueReciverConnector {
    private static connUrl: string = String(process.env.RECEIVER_QUE_CON_URL);
    private static opt: any = { credentials: amqp.credentials.plain(String(process.env.RECEIVER_QUE_USERNAME), String(process.env.RECEIVER_QUE_PSWRD)) };
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
            let ch = app.get(Constant.commanConst.rabbitMQRecieverConn);
            // Get chhanel connection if not exist
            if (!ch) {
                ch = await this.createConnection();
                app.set(Constant.commanConst.rabbitMQRecieverConn, ch);
            }
            return ch;
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
}