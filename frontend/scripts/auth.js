// auth.js – Hilfsfunktionen für Rollenbasierte Authentifizierung
import * as Api from "./api.js";

export function parseJwt(token) {
    try {
        const base64 = token.split(".")[1];
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
}

export function getUserToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        redirectToGetStartedPage();
        // throw new Error("Token nicht gefunden"); // Removed: error will never be caught after redirect
    }
    return token;
}

export function getUserFromToken() {
    const token = getUserToken();
    return parseJwt(token);
}

// Logout
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userData"); // delete initial user data

    // reload site 
    // location.reload();


    alert("Your session has expired. You are being logged out.");
    window.location.href = "./html-pages/unauthorized.html";
}

export async function checkRoleAccess(allowedRoles) {
    try {
        const userData = getUserFromToken();
        if (!userData || !allowedRoles.includes(userData.role)) {
            redirectToUnauthorizedPage();
        }
    } catch (error) {
        // TOKEN NOT FOUND ERROR
        console.warn("Access denied because no token was found. Redirecting...");
        // redirectToUnauthorizedPage(); // !!!! DONT DELETE THIS COMMENT
        redirectToGetStartedPage();
    }
}

export function redirectToGetStartedPage() {
    window.location.href = "./set-up/pages/getstarted.html"; //#specialLink
}

export async function redirectToUnauthorizedPage() {
    const body = document.getElementsByTagName("body")[0];
    body.innerHTML = "!! ACCESS DENIED !!";

    await new Promise((resolve) => setTimeout(resolve, 1)); // sonst ist content noch sichtbar

    alert("No access to this page.");

    window.location.href = "./html-pages/unauthorized.html"; // Fehlerseite //#specialLink
}

export function returnUserRole() {
    const userData = getUserFromToken();

    if (userData) {
        return userData.role;
    }
}

export function requiredUserRole(role) {
    const userData = getUserFromToken();

    if (userData) {
        return userData.role === role;
    }
}

// check if user toke is valid use my api.js functions:

export async function checkSessionTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("[checkSessionTokenValid] Kein Token gefunden");
    redirectToGetStartedPage();
    return "expired";
  }

  try {
    const response = await Api.fetchDataWithToken("/check-token", token);

    if (!response) {
      console.warn(
        "[checkSessionTokenValid] ❌ Token abgelaufen – Nutzer wird ausgeloggt"
      );
      logout();
      return "expired";
    }

    try {
        const response = await Api.fetchDataWithToken("/check-token", token);

        // if (!response.valid) {
        //   console.warn("[checkSessionTokenValid] ❌ Token ungültig oder abgelaufen – Nutzer wird ausgeloggt");
        //   logout();
        //   return false;
        // }

        console.log("[checkSessionTokenValid] ✅ Token gültig");
        return true;
    } catch (err) {
        if (err.message.includes("403")) {
            console.warn(
                "[checkSessionTokenValid] ❌ Token abgelaufen – Nutzer wird ausgeloggt"
            );
            logout();
            return false;
        }

        // Andere Fehler, z.B. Netzwerkproblem, Server nicht erreichbar
        console.warn(
            "[checkSessionTokenValid] ⚠️ Server nicht erreichbar – Tokenstatus unbekannt, Nutzer bleibt eingeloggt"
        );
        return true;
    }
}
