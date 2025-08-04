import type { HttpPlugin, HttpOptions, HttpResponse, HttpDownloadFileOptions, HttpDownloadFileResult, HttpUploadFileOptions, HttpUploadFileResult, HttpCookie, HttpCookieMap, HttpGetCookiesResult, HttpSetCookieOptions, HttpMultiCookiesOptions, HttpSingleCookieOptions } from './definitions';
import { WebPlugin } from '@capacitor/core';
export declare class HttpWeb extends WebPlugin implements HttpPlugin {
    constructor();
    /**
     * Perform an Http request given a set of options
     * @param options Options to build the HTTP request
     */
    request: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Perform an Http GET request given a set of options
     * @param options Options to build the HTTP request
     */
    get: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Perform an Http POST request given a set of options
     * @param options Options to build the HTTP request
     */
    post: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Perform an Http PUT request given a set of options
     * @param options Options to build the HTTP request
     */
    put: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Perform an Http PATCH request given a set of options
     * @param options Options to build the HTTP request
     */
    patch: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Perform an Http DELETE request given a set of options
     * @param options Options to build the HTTP request
     */
    del: (options: HttpOptions) => Promise<HttpResponse>;
    /**
     * Gets all HttpCookies as a Map
     */
    getCookiesMap: (options: HttpMultiCookiesOptions) => Promise<HttpCookieMap>;
    /**
     * Get all HttpCookies as an object with the values as an HttpCookie[]
     */
    getCookies: (options: HttpMultiCookiesOptions) => Promise<HttpGetCookiesResult>;
    /**
     * Set a cookie
     * @param key The key to set
     * @param value The value to set
     * @param options Optional additional parameters
     */
    setCookie: (options: HttpSetCookieOptions) => Promise<void>;
    /**
     * Gets all cookie values unless a key is specified, then return only that value
     * @param key The key of the cookie value to get
     */
    getCookie: (options: HttpSingleCookieOptions) => Promise<HttpCookie>;
    /**
     * Deletes a cookie given a key
     * @param key The key of the cookie to delete
     */
    deleteCookie: (options: HttpSingleCookieOptions) => Promise<void>;
    /**
     * Clears out cookies by setting them to expire immediately
     */
    clearCookies: (options: HttpMultiCookiesOptions) => Promise<void>;
    /**
     * Clears out cookies by setting them to expire immediately
     */
    clearAllCookies: () => Promise<void>;
    /**
     * Uploads a file through a POST request
     * @param options TODO
     */
    uploadFile: (options: HttpUploadFileOptions) => Promise<HttpUploadFileResult>;
    /**
     * Downloads a file
     * @param options TODO
     */
    downloadFile: (options: HttpDownloadFileOptions) => Promise<HttpDownloadFileResult>;
}
