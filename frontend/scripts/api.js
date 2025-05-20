// BACKEND base-URL
// const apiBaseUrl = 'http://172.18.45.1:3000'; // DIREKT
const apiBaseUrl = 'https://gfoh.ddns.net:6969'; // PER REVERSE PROXY
// const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

// fetching any DATA-ENDPOINT from BACKEND
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Fehler beim Abrufen von ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export { fetchData };