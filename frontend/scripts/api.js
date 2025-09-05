// BACKEND base-URL
// const apiBaseUrl = 'http://172.18.45.1:3000'; // DIREKT
const apiBaseUrl = 'https://nutripilot.ddns.net:443/api'; // PER REVERSE PROXY
// const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

import * as nativeSw from './native/nativeSw.js';

// global port
window.port = 443;

// fetching any DATA-ENDPOINT from BACKEND
export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`❌❌❌❌Fehler beim Abrufen von ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅✅✅✅ ERFOLGREICH GELADEN!" + endpoint);
    return data;

  } catch (error) {
    console.error(error);

    // ERRR 503 (DB RESTARTING)
    if (error?.message?.includes("503") ||
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("Service Unavailable")) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("❌❌❌❌ Retrying fetch for " + endpoint + " due to 503... ❌❌❌❌");
      return await fetchData(endpoint);
    }

    return null;
  }

}

// GET with token (Authorization-Header)
export async function fetchDataWithToken(endpoint, token) {
  try {
    console.log(`[fetchDataWithToken] ➜ Endpoint: ${endpoint}, Token:`, token);

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`[fetchDataWithToken] ⇐ Status: ${response.status}`);

    if (response.status === 403) {
      // Token abgelaufen oder ungültig
      console.log("403");
      throw new Error('Token abgelaufen oder ungültig (403 Forbidden)');
    }

    if (!response.ok) {
      console.log("other error");
      throw new Error(`Fehler beim Abrufen von ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[fetchDataWithToken] ✅ Erfolgreich geladen:`, data);
    console.log("✅✅✅✅ ERFOLGREICH GELADEN!" + endpoint);
    return data;
  } catch (error) {
    console.error(error);

    // ERRR 503 (DB RESTARTING)
    if (error?.message?.includes("503") ||
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("Service Unavailable")) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("❌❌❌❌ Retrying fetch for " + endpoint + " due to 503... ❌❌❌❌");
      return await fetchDataWithToken(endpoint, token);
    }

    return null;
  }

}

export async function postData(endpoint, data, token) {
  try {
    console.log(data);
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Senden von ${endpoint}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅✅✅✅ ERFOLGREICH GELADEN!" + endpoint);
    return result;

  } catch (error) {
    console.error(error);

    // ERRR 503 (DB RESTARTING)
    if (error?.message?.includes("503") ||
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("Service Unavailable")) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("❌❌❌❌ Retrying fetch for " + endpoint + " due to 503... ❌❌❌❌");
      console.log(data);
      return await postData(endpoint, data, token);
    }

    return null;
  }

}
