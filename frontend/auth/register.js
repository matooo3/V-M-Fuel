const API_BASE = 'https://gfoh.ddns.net:3000';

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        document.getElementById('message').textContent = 'Registrierung erfolgreich. Jetzt einloggen.';
    } else {
        document.getElementById('message').textContent = data.message || 'Fehler bei der Registrierung.';
    }
});
