window.port = 443;
const API_BASE = `https://nutripilot.ddns.net:${window.port}`;

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const termsDiv = document.querySelector('.terms-checkbox');
    termsDiv.innerHTML = '<p id="message"></p>';

    try {
        const res = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById('message').textContent = 'Registration was successful. Please log in.';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = "../../index.html#home"; //#specialLink

        } else {
            document.getElementById('message').textContent = data.message || 'Fehler bei der Registrierung.';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Netzwerkfehler oder Server nicht erreichbar.';
        console.error('Fetch Error:', error);
    }

    


});
