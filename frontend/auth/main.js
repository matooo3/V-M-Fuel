const API_BASE = 'https://gfoh.ddns.net:3000';

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
        document.getElementById('message').textContent = 'Login erfolgreich!';
    } else {
        document.getElementById('message').textContent = data.message || 'Login fehlgeschlagen.';
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
