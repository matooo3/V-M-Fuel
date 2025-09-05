export function getDomain() {
    return "https://nutripilot.ddns.net";
}

export function getPort() {
    return 443;
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
