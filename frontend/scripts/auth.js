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
    const userData = getUserFromToken();
    if (!userData || !allowedRoles.includes(userData.role)) {

        const body = document.getElementsByTagName('body')[0];
        body.innerHTML = "!! ACCESS DENIED !!";

        await new Promise(resolve => setTimeout(resolve, 1));

        alert("No access to this page.");

        window.location.href = "/frontend/html-pages/unauthorized.html";  // Fehlerseite
    }
}

export function returnUserRole() {
    const userData = getUserFromToken();

    if(userData) {
        return userData.role;
    }
}

export function requiredUserRole(role) {
    const userData = getUserFromToken();

    if(userData) {
         return (userData.role === role);
    }
}