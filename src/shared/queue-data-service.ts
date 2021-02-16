import { EntityType } from '@shared/enums/entity-type-enum';
import { OperationType } from '@shared/enums/operation-type-enum';
import { QueueHandler } from '@shared/queues';
import { Any } from 'json2typescript';
import { Constant } from './constants';
import { ReloadType } from './enums/comman-enum';

export class QueueDataHandler {

/** Will Prepare and send data to queue
     * @param CONTACT 
     * @param CREATE 
     * @param parsedContacts 
     */
    static prepareAndSendQueueData(entityType: EntityType, operationType: OperationType, businessId: string, data:any,reloadType?:ReloadType,monthlyReloadDate?:string) {
        if (data && data.length == 0) {
            return;
        }

        let queueData =
        {
            metadata:
            {
                entity: entityType,
                operation: operationType,
                timestamp: new Date().toISOString(),
                source: Constant.commanConst.smaiMYOBService.toString(),
                destination: Constant.commanConst.smaiBusinessService.toString(),
                businessId: businessId,
                reloadType: reloadType,
                monthlyReloadDate:monthlyReloadDate    
            },
            data: data
        }
        console.log('queueData', queueData);
        QueueHandler.sendMessage(process.env.WEBHOOK_SMAI_BUSINESS_QUEUE, queueData);
    }

}