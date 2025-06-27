import { requiredUserRole, returnUserRole } from "/frontend/scripts/auth.js";

const cookTestDiv = document.getElementById("cookTest");

if(requiredUserRole("admin")) {
    cookTestDiv.innerHTML = "you are an admin";
}

if(returnUserRole() === "cook") {
    cookTestDiv.innerHTML = "you are a cook";
}
