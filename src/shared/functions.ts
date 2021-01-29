import logger from './logger';
import moment from 'moment';
import { WebhookModel } from '@entities/webhookData.entity';
import moment_tz from 'moment-timezone'
import fse from 'fs-extra';
import { DateFormat } from './enums/comman-enum';

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

/** Gets Random Number
 * 
 */
export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

/** Will find an element by Key in NameValue Collection Coming Back from QB by matching arg1
 * 
 * @param NameValue 
 * @param arg1 
 */
export const getValueByKey = (NameValue: [], arg1: string) => {
    let match: any = NameValue.find((item: { Name: string, Value: string }) => {
        return item.Name === arg1;
    })
    if (match)
        return match.Value;
    else return ""
}

/** Will add Seconds to Current DateTime and return you date in ISO string
 * 
 * @param seconds 
 */
export const getDateByAddingSeconds = (seconds: number) => {
    let date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return date.toISOString();
}

/** Will spilt date range into sub date groups based on days
 *  pass start date ,end date and no of days
 *  will spilt into sub date groups
 * @param startDate 
 * @param endDate 
 * @param days 
 */
export const getDateGroupsBetweenTwoDays = (startDate: any, endDate: any, days: number): any => {
    var date1 = moment(startDate, DateFormat.date);
    var date2 = moment(endDate, DateFormat.date);
    let dateGroups = [];
    while (true) {
        if (date2.diff(date1, 'days') > days) {
            let temp = date1.format(DateFormat.date)
            let eDate = date1.add(days, 'day');
            dateGroups.push({ end: date1.format(DateFormat.date), start: temp });
            date1 = moment(eDate).add(1, 'day')
        }
        else {
            dateGroups.push({ start: date1.format(DateFormat.date), end: date2.format(DateFormat.date) })
            break;
        }
    }
    return dateGroups;
}

/**
 * Will return you a date in ISO string by adding or Subtracting No of months passed
 * @param month 
 * @param resetDate  if true will send date with 1st day of month 
 * eg:-date is "2020-04-20" addMonths(-1,true) will return "2020-03-01T00:00:00.000Z"
 * eg:-date is "2020-04-20" addMonths(-1) will return "2020-03-20T00:00:00.000Z"
 */
export const addMonths = (month: number, timezone: string, resetDate?: boolean, crntDate?: Date) => {
    let tzDate = moment_tz(moment_tz.now()).tz(timezone).format(DateFormat.date)
    let currentDate = new Date(tzDate);
    if (crntDate) {
        currentDate = crntDate;
    }
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    currentDate.setMonth(currentDate.getMonth() + month);
    if (resetDate) {
        currentDate.setDate(1);
        currentDate.setHours(-1);
    }
    return currentDate.toISOString();
}

export const getFirstDate = function (date: Date) {
    date.setDate(1);
    return subDays(date, 365);
}

export const addDays = function (date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
}

export const subDays = function (date: Date, days: number) {
    date.setDate(date.getDate() - days);
    return date;
}
export const getDate = function (datestr: string) {
    try {
        let date = new Date(datestr);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let dtstr = ''
        let monthstr = ''
        if (dt < 10) {
            dtstr = '0' + dt;
        }
        if (month < 10) {
            monthstr = '0' + month;
        }
        let formattedDate = year + '-' + monthstr + '-' + dtstr
        return formattedDate;
    } catch (error) {
        throw error
    }

}

export function writeWebHookLogs(item: WebhookModel) {
    fse.outputFile('webhook-logs/' + new Date().toDateString() + '/' + item.platformBusinessId + '/' + item.platformBusinessId + '-' + new Date().getTime() + '.txt', JSON.stringify(item), (err: Error) => {
        if (err) {
            logger.error(err);
        }
    })
}
/**
   * This function is for string formatting or insert values in string
   * @param str String
   * @param arg Arguments to insert into string
   */
export function stringFormat(str: string, arg: string[]) {
    let i: number = 0;
    for (; i < arg.length; i++) {
        str = str.replace("{" + i + "}", arg[i])
    }
    return str
}

export function textTruncate(str: string, length: number, ending: string) {
    if (str.length >= length) {
        return str.substring(0, length - ending.length) + ending;
    } else {
        return str;
    }
};

export const reqHeaderCreator = (authToken?: string) => {
    let header: any = {
        'Accept': 'application/json'
    }
    if (authToken) {
        header.Authorization = 'Bearer ' + authToken;
    }
    return header;
}