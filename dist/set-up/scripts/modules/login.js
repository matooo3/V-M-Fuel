import { parseJwt, getUserFromToken, checkRoleAccess } from './auth.js';
import * as Storage from './storage.js';

window.port = 443;
const API_BASE = `https://nutripilot.ddns.net:${window.port}`;

document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('token', data.token);
        document.getElementById('message').textContent = 'Login successful!';

        // Nach dem Login Token analysieren und weiterleiten je nach Rolle
        const userData = parseJwt(data.token);

        await new Promise(resolve => setTimeout(resolve, 1000));

        window.location.href = "../../index.html"; //#specialLink
        // window.location.href = "../../index.html#home"; //#specialLink

        
    } else {
        document.getElementById('message').textContent = data.message || 'Login failed.';
    }

});

// Beispiel API-Aufruf mit Token
async function fetchDishes() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/dishes`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    console.log(data);
}
