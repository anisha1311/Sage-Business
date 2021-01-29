const axios = require('axios').default;
export class HTTPService {
    options = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'timeout': Number.parseInt(process.env.TIMEOUT || "5000")
    };

    /** Get Method */
    get(url: string, options?: any) {
        return axios.get(url, options || this.options)
    }

    patch(url: string, requestBody: any, options?: any) {

        return axios.patch(url, requestBody, options || this.options)

    }

    /** Post Method */
    post(url: string, requestBody?: any, options?: any) {
        return axios.post(url, requestBody, options || this.options)
    }

    /** Delete Method */
    delete(url: string, options?: any) {
        return axios.delete(url, options)
    }
}