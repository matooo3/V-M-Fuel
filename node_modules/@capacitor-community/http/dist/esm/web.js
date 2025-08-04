import { WebPlugin } from '@capacitor/core';
import * as Cookie from './cookie';
import * as Request from './request';
export class HttpWeb extends WebPlugin {
    constructor() {
        super();
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        this.request = async (options) => Request.request(options);
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        this.get = async (options) => Request.get(options);
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        this.post = async (options) => Request.post(options);
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        this.put = async (options) => Request.put(options);
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        this.patch = async (options) => Request.patch(options);
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        this.del = async (options) => Request.del(options);
        /**
         * Gets all HttpCookies as a Map
         */
        this.getCookiesMap = async (
        // @ts-ignore
        options) => {
            const cookies = Cookie.getCookies();
            const output = {};
            for (const cookie of cookies) {
                output[cookie.key] = cookie.value;
            }
            return output;
        };
        /**
         * Get all HttpCookies as an object with the values as an HttpCookie[]
         */
        this.getCookies = async (options) => {
            // @ts-ignore
            const { url } = options;
            const cookies = Cookie.getCookies();
            return { cookies };
        };
        /**
         * Set a cookie
         * @param key The key to set
         * @param value The value to set
         * @param options Optional additional parameters
         */
        this.setCookie = async (options) => {
            const { key, value, expires = '', path = '' } = options;
            Cookie.setCookie(key, value, { expires, path });
        };
        /**
         * Gets all cookie values unless a key is specified, then return only that value
         * @param key The key of the cookie value to get
         */
        this.getCookie = async (options) => Cookie.getCookie(options.key);
        /**
         * Deletes a cookie given a key
         * @param key The key of the cookie to delete
         */
        this.deleteCookie = async (options) => Cookie.deleteCookie(options.key);
        /**
         * Clears out cookies by setting them to expire immediately
         */
        this.clearCookies = async (
        // @ts-ignore
        options) => Cookie.clearCookies();
        /**
         * Clears out cookies by setting them to expire immediately
         */
        this.clearAllCookies = async () => Cookie.clearCookies();
        /**
         * Uploads a file through a POST request
         * @param options TODO
         */
        this.uploadFile = async (options) => {
            const formData = new FormData();
            formData.append(options.name, options.blob || 'undefined');
            const fetchOptions = Object.assign(Object.assign({}, options), { body: formData, method: 'POST' });
            return this.post(fetchOptions);
        };
        /**
         * Downloads a file
         * @param options TODO
         */
        this.downloadFile = async (options) => {
            const requestInit = Request.buildRequestInit(options, options.webFetchExtra);
            const response = await fetch(options.url, requestInit);
            let blob;
            if (!(options === null || options === void 0 ? void 0 : options.progress))
                blob = await response.blob();
            else if (!(response === null || response === void 0 ? void 0 : response.body))
                blob = new Blob();
            else {
                const reader = response.body.getReader();
                let bytes = 0;
                let chunks = [];
                const contentType = response.headers.get('content-type');
                const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    chunks.push(value);
                    bytes += (value === null || value === void 0 ? void 0 : value.length) || 0;
                    const status = {
                        type: 'DOWNLOAD',
                        url: options.url,
                        bytes,
                        contentLength,
                    };
                    this.notifyListeners('progress', status);
                }
                let allChunks = new Uint8Array(bytes);
                let position = 0;
                for (const chunk of chunks) {
                    if (typeof chunk === 'undefined')
                        continue;
                    allChunks.set(chunk, position);
                    position += chunk.length;
                }
                blob = new Blob([allChunks.buffer], { type: contentType || undefined });
            }
            return {
                blob,
            };
        };
    }
}
//# sourceMappingURL=web.js.map