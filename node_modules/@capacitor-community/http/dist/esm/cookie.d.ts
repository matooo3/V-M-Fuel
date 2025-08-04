import { HttpCookie, HttpCookieOptions } from './definitions';
/**
 * Set a cookie
 * @param key The key to set
 * @param value The value to set
 * @param options Optional additional parameters
 */
export declare const setCookie: (key: string, value: any, options?: HttpCookieOptions) => void;
/**
 * Gets all HttpCookies
 */
export declare const getCookies: () => HttpCookie[];
/**
 * Gets a single HttpCookie given a key
 */
export declare const getCookie: (key: string) => HttpCookie;
/**
 * Deletes a cookie given a key
 * @param key The key of the cookie to delete
 */
export declare const deleteCookie: (key: string) => void;
/**
 * Clears out cookies by setting them to expire immediately
 */
export declare const clearCookies: () => void;
