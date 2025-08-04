/**
 * Read in a Blob value and return it as a base64 string
 * @param blob The blob value to convert to a base64 string
 */
export declare const readBlobAsBase64: (blob: Blob) => Promise<string>;
/**
 * Safely web encode a string value (inspired by js-cookie)
 * @param str The string value to encode
 */
export declare const encode: (str: string) => string;
/**
 * Safely web decode a string value (inspired by js-cookie)
 * @param str The string value to decode
 */
export declare const decode: (str: string) => string;
