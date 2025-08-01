export function getDomain() {
    return "https://gfoh.ddns.net";
}

export function getPort() {
    return 6969;
}

export function getUrl() {
    return `${getDomain()}:${getPort()}`;
}

export function getApiUrl() {
    return `${getUrl()}/api`;
}

export function getFrontendUrl() {
    return `${getUrl()}/frontend`;
}
