
import * as tracer from 'tracer';
import axios from 'axios';
import { ServiceType } from './enums/comman-enum';

export class ApplicationLogger {

    url = process.env.RABBITQUEUE_URL
    logger: any;
    constructor() {
        this.logger = tracer.console(this.log_conf)
    }

    log_conf = {
        level: 'info',
        transport: [logToConsole],
        dateformat: 'isoUtcDateTime'
    }
    /**
     * Post error log to mongdb on error logging service
     * @param data 
     */
    async logToDB(data: any) {
        try {
            let errrorInfo = {
                message: data.message || 'NA',
                functionName: data.method || 'NA',
                stackTrace: data.stack || 'NA',
                timestamp: data.timestamp,
                file: data.file || 'NA',
                businessId: data.args && data.args['1'] || 'NA',
                contentData: data.args && data.args['2'] || 'NA',
                serviceType: ServiceType.smaiQbService// Service type 1-smai-business-service 2-smai-qb-service,3-smai-xero-service
            }
            let result = await PostLogs(errrorInfo)
            return result
        }
        catch (err) {
            let error = err.message;
            let logdata = { logdata: data };
            let append = error + '\n' + JSON.stringify(logdata);
            err.message = append;
            return null
        }
    }

};

function logToConsole(data: any) {
    console.log("[Logs] :- " + data.message + "  | file:- " + data.file + "  | Method:- " + data.method + " | Line:- " + data.line);
}

async function PostLogs(data: any) {
    try {
        const url: string = process.env.LOGGER_APP_URL + 'api/errorlog/add/';
        let result = await axios.post(url, data)
        return result.data
    } catch (err) {
        console.log("PostLogs err" + err)
        throw err;
    }

}
