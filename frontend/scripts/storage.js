import * as Api from "./api.js";
import { getUserFromToken } from "./auth.js";

// generic save-function, so if we change from LS to IndexedDB we can easily modify that here
export function saveToLS(key, data) {
    if (data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// ---------------------- get() ----------------------------------
// get DISHES
export async function getDishes() {
    const dishes = await Api.fetchData("/dishes");
    // saveToLS('dishes', dishes);
    return dishes;
}

// get DISH INGREDIENTS
export async function getDishIngredients() {
    const dishIngredients = await Api.fetchData("/dish_ingredients");
    //   saveToLS('dishIngredients', dishIngredients);
    return dishIngredients;
}

// get INGREDIENTS
export async function getIngredients() {
    const ingredients = await Api.fetchData("/ingredients");
    //     saveToLS('ingredients', ingredients);
    return ingredients;
}

// get USERS
export async function getUsers() {
    const users = await Api.fetchData("/users");
    //     saveToLS('users', users);
    return users;
}

// get USER-DISHES
export async function getUserDishes() {
    const userDishes = await Api.fetchData("/user_dishes");
    //     saveToLS('userDishes', userDishes);
    return userDishes;
}

// get dishes with ingredients
export async function getDishesWithIngredients() {
    const dishesWithIngredients = await Api.fetchData("/dishes_full");
    // saveToLS('dishesWithIngredients', dishesWithIngredients); // optional
    return dishesWithIngredients;
}

// -----------------------------------END------------------------------------------

// ------------------------------- GET DATA DB (MAIN) -----------------------------
// get ALL DATA (main function)
export async function getDataDB() {
    const dishes = await getDishes();
    const ingredients = await getIngredients();
    const users = await getUsers();
    const userDishes = await getUserDishes();
    const dishIngredients = await getDishIngredients();

    const data = { dishes, ingredients, users, userDishes, dishIngredients };

    // data --> json-Format
    // save to LocalStorage
    saveToLS("data", data);

    return data;
}
// -------------------------------------------------------------------------------

// ------------------------------- GET DATA LS (2. MAIN) -------------------------
export function getDataLS() {
    const storedData = localStorage.getItem("data");
    if (!storedData) return null; // Falls keine Daten gespeichert sind, gib null zurück

    try {
        return JSON.parse(storedData); // Daten parsen und zurückgeben
    } catch (error) {
        console.error("Fehler beim Parsen der gespeicherten Daten:", error);
        return null;
    }
}
// -------------------------------------------------------------------------------

// ------------------------------------- MAIN ------------------------------------
export async function getData() {
    //if internet
    return await getDataDB();

    //if no internet
    // ....
}
//---------------------------------------------------------------------------------

export async function setData() {
    saveToLS();
    saveToDB();
}

// ---------------------------------------------------------------
// CHANGE USER ROLE IN DB

export async function getUserIDFromDB(email) {
    const users = await Api.fetchData("/users");
    const user = users.find((u) => u.email === email);

    if (!user) {
        throw new Error("Benutzer nicht gefunden");
    }

    return user.user_id;
}

export async function changeUserRoleInDB(role, email) {
    try {
        // 1. User aus DB (Email → userId)
        const userId = await getUserIDFromDB(email);

        // 2. Auth-Token holen
        const token = localStorage.getItem("token"); // oder dein Token-Handling
        if (!token) {
            throw new Error("Token nicht gefunden");
        }

        // 3. Anfrage an Backend
        const userData = { userId, role };
        const result = await Api.postData("/set-role", userData, token);

        alert("Rolle erfolgreich geändert!");
    } catch (error) {
        alert("Fehler beim Rollenwechsel: " + error.message);
    }
}

export async function addNewDishToDB(data) {
    try {
        // 1. Auth-Token holen
        const token = localStorage.getItem("token"); // oder dein Token-Handling
        if (!token) {
            throw new Error("Token nicht gefunden");
        }

        // 2. Anfrage an Backend
        const result = await Api.postData("/add-dishes", data, token);
        
    } catch (error) {
      alert("Failed to add new dish: " + error.message);
    }
}
