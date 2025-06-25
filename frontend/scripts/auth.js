// auth.js – Hilfsfunktionen für Rollenbasierte Authentifizierung

export function parseJwt(token) {
    try {
        const base64 = token.split('.')[1];
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
}

export function getUserFromToken() {
    const token = localStorage.getItem('token');
    return parseJwt(token);
}

export async function checkRoleAccess(allowedRoles) {
    const user = getUserFromToken();
    if (!user || !allowedRoles.includes(user.role)) {

        const body = document.getElementsByTagName('body')[0];
        body.innerHTML = "!! ACCESS DENIED !!";

        await new Promise(resolve => setTimeout(resolve, 1));

        alert("Kein Zugriff auf diese Seite.");

        window.location.href = "/frontend/html-pages/unauthorized.html";  // Fehlerseite
    }
}
