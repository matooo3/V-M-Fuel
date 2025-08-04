import type { HttpOptions, HttpResponse } from './definitions';
/**
 * Build the RequestInit object based on the options passed into the initial request
 * @param options The Http plugin options
 * @param extra Any extra RequestInit values
 */
export declare const buildRequestInit: (options: HttpOptions, extra?: RequestInit) => RequestInit;
/**
 * Perform an Http request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const request: (options: HttpOptions) => Promise<HttpResponse>;
/**
 * Perform an Http GET request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const get: (options: HttpOptions) => Promise<HttpResponse>;
/**
 * Perform an Http POST request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const post: (options: HttpOptions) => Promise<HttpResponse>;
/**
 * Perform an Http PUT request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const put: (options: HttpOptions) => Promise<HttpResponse>;
/**
 * Perform an Http PATCH request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const patch: (options: HttpOptions) => Promise<HttpResponse>;
/**
 * Perform an Http DELETE request given a set of options
 * @param options Options to build the HTTP request
 */
export declare const del: (options: HttpOptions) => Promise<HttpResponse>;
