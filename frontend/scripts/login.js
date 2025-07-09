import { parseJwt, getUserFromToken, checkRoleAccess } from '/frontend/scripts/auth.js';

window.port = 6969;
const API_BASE = `https://gfoh.ddns.net:${window.port}`;

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

        // if (userData.role === 'admin') {
        //     window.location.href = "/frontend/index.html#home";
        // } else if (userData.role === 'cook') {
        //     window.location.href = "/frontend/auth/cook.html";
        // } else {
        //     window.location.href = "/frontend/auth/user.html";
        // }

        window.location.href = "/frontend/index.html";

        // window.location.href = "../../index.html#home";
        
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
