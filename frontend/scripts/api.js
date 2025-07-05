// BACKEND base-URL
// const apiBaseUrl = 'http://172.18.45.1:3000'; // DIREKT
const apiBaseUrl = 'https://gfoh.ddns.net:6969/api'; // PER REVERSE PROXY
// const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

// global port
window.port = 6969;

// fetching any DATA-ENDPOINT from BACKEND
export async function fetchData(endpoint) {
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

// GET with token (Authorization-Header)
export async function fetchDataWithToken(endpoint, token) {
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
  return data;
}




export async function postData(endpoint, data, token) {
  try {
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
    return result;

  } catch (error) {
    console.error(error);
    return null;
  }
}
