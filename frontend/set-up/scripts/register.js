window.port = 6969;
const API_BASE = `https://gfoh.ddns.net:${window.port}`;

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('message').textContent = 'Registrierung erfolgreich. Jetzt einloggen.';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = "../../index.html#home";

        } else {
            document.getElementById('message').textContent = data.message || 'Fehler bei der Registrierung.';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Netzwerkfehler oder Server nicht erreichbar.';
        console.error('Fetch Error:', error);
    }

    


});
