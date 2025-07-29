import * as Api from "./api.js";
import * as Auth from "./auth.js";

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

export async function getDishesBreakfast() {
    const dishesBreakfast = await Api.fetchData("/dishes-breakfast");
    // saveToLS('dishes', dishes);
    return dishesBreakfast;
}

export async function getDishesMain() {
    const dishesMain = await Api.fetchData("/dishes-main");
    // saveToLS('dishes', dishes);
    return dishesMain;
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
    const users = await Api.fetchDataWithToken("/users", Auth.getUserToken());
    //     saveToLS('users', users);
    return users;
}

// get USER-DISHES
export async function getUserDishes() {
    const userDishes = await Api.fetchDataWithToken("/user_dishes", Auth.getUserToken());
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
    // const userDishes = await getUserDishes();
    const dishIngredients = await getDishIngredients();

    const data = { dishes, ingredients, users, dishIngredients };

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
    
    const users = await Api.fetchDataWithToken("/users", Auth.getUserToken());

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
        const token = Auth.getUserToken();

        // 3. Anfrage an Backend
        const userData = { userId, role };
        const result = await Api.postData("/set-role", userData, token);

        alert("Rolle erfolgreich geändert!");
        return result;
    } catch (error) {
        alert("Fehler beim Rollenwechsel: " + error.message);
    }
}

export async function deleteUserFromDB(userID) {
    try {
        // 1. Auth-Token holen
        const token = Auth.getUserToken();

        // 2. Anfrage an Backend
        const result = await Api.postData("/delete-user", { userID }, token);
        return result; // Return the API response
    } catch (error) {
        alert("Failed to delete user: " + error.message);
        return false; // Indicate failure
    }
}

//  -------------- ADD DISH & INGREDIENT -----------------------
export async function addNewDishToDB(data) {
    try {
        // 1. Auth-Token holen
        const token = Auth.getUserToken();

        // 2. Anfrage an Backend
        const result = await Api.postData("/add-dish", data, token);
        
        return result;
    } catch (error) {
      alert("Failed to add new dish: " + error.message);
    }
}


export async function addNewIngredientToDB(data) {
    try {
        // 1. Auth-Token holen
        const token = Auth.getUserToken();

        // 2. Anfrage an Backend
        const result = await Api.postData("/add-ingredient", data, token);
        
        return result;
    } catch (error) {
      alert("Failed to add new ingredient: " + error.message);
    }
}

//  ----------------- DELETE DISH & INGREDIENT -----------------
export async function deleteDishFromDB(dishID) {
    try {
        // 1. Auth-Token holen
        const token = Auth.getUserToken();

        // 2. Anfrage an Backend
        const result = await Api.postData("/delete-dish", { dishID }, token);
        
        return result;
    } catch (error) {
      alert("Failed to delete dish: " + error.message);
    }
}

export async function deleteIngredientFromDB(ingredientID) {
    try {
        // 1. Auth-Token holen
        const token = Auth.getUserToken();

        // 2. Anfrage an Backend
        const result = await Api.postData("/delete-ingredient", { ingredientID }, token);
        
        return result;
    } catch (error) {
      alert("Failed to delete ingredient: " + error.message);
    }
}

// -------------------------- USER DATA ----------------------------
// MEAL PLAN DB
export function saveWeekPlanToDB(weekPlan) {

    const user = Auth.getUserFromToken();
    Api.postData("/add-week-plan", { weekPlan, userId: user.id }, Auth.getUserToken());
}

export async function getWeekPlanFromDB() {
  const token = Auth.getUserToken();
  const weekPlan = await Api.fetchDataWithToken("/get-week-plan", token);
  return weekPlan;
}

export async function getIngredientsFromWeekPlan() {
    const token = Auth.getUserToken();
    const result = await Api.fetchDataWithToken("/get-ingredients-from-week-plan", token);
    return result;
}


// Local storage (for login / initial data)
export function saveUserDataToLS(userData) {
    saveToLS('userData', userData);
}

export function getUserDataFromLS() {
    try {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading user data:', error);
        return {};
    }
}


// SAVE USER DATA
export async function saveUserDataToDB(userInfo) {
  const token = Auth.getUserToken();

  if (!token || !userInfo) {
    throw new Error("Token or UserInfo is missing");
  }

  await Api.postData("/save-user-data", userInfo, token);
}

// GET USER DATA
export async function getUserDataFromDB() {

    const token = Auth.getUserToken();
    const data = await Api.fetchDataWithToken("/get-user-data", token);
  
    return data; // { gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal }

}

export async function saveInitialUserDataToDB() {
    const userData = getUserDataFromLS();

    if (!userData.gender || !userData.age || !userData.weight || !userData.height || !userData.activityLevel || !userData.goal) {
        console.warn("No user data found in local storage. Skipping initial save.");
        return;
    }

    console.warn("Saving initial user data to DB...");

    const initialData = {
        gender: userData.gender,
        age: userData.age,
        weight_kg: userData.weight?.kg,
        weight_pounds: userData.weight?.pounds,
        height_cm: userData.height?.cm,
        height_feet_and_inches: userData.height?.feetAndInches,
        activityLevel: userData.activityLevel,
        goal: userData.goal
    };

    try {
        // Send initial data to the database
        await saveUserDataToDB(initialData);
        localStorage.removeItem("userData"); // delete initial user data (only keep until in DB)
    } catch (error) {
        console.error("Failed to save initial user data to DB:", error);
    }
}

// SAVE NEXT MEALS
export async function saveNextMealsToDB(next_meals) {
    
  const token = Auth.getUserToken();

  console.log("Data being sent to save-next-meals:", next_meals);

  if (!token || !next_meals) {
    throw new Error("Token or UserInfo is missing");
  }

  await Api.postData("/save-next-meals", { next_meals }, token);
}

// GET NEXT MEALS
export async function getNextMealsFromDB() {

    const token = Auth.getUserToken();
    const data = await Api.fetchDataWithToken("/get-next-meals", token);
  
    return data; 

}

//////////////////// USER LIST ITEMS ///////////////////

// SET WHOLE LIST
export async function setUserListItemsInDB(items) {
    // items is:
    //           [ { id, name, amount, unit }, 
    //             { id, name, amount, unit }, ... ]
  const token = Auth.getUserToken();

  if (!token || !Array.isArray(items) || items.length === 0) {
    throw new Error("Token or items list is missing or empty");
  }

  await Api.postData("/set-user-list-items", { items }, token);
}

export async function getUserListItemsFromDB() {
  const token = Auth.getUserToken();
  const data = await Api.fetchDataWithToken("/get-user-list-items", token);
  return data;
  // format:
  /**
   * {
   *   ingredient_id: 4,
   *   name: "chicken breast filet",
   *   amount: 556.09,
   *   unit_of_measurement: "g",
   *   category: "Protein",
   *   ingredient_unit: "100g",
   *   calories_per_UoM: 105,
   *   carbs_per_UoM: 0.6,
   *   fats_per_UoM: 2,
   *   protein_per_UoM: 21
   * }
   */

}



// ADD USER LIST ITEM
export async function addUserListItemToDB(item) {
    //   {ingredient_id: 12, amount: 100, unit_of_measurement: "g"}
  const token = Auth.getUserToken();

  if (!token || !item) {
    throw new Error("Token or item is missing");
  }

  await Api.postData("/add-user-list-item", item, token);
}


// DELETE USER LIST ITEM (via POST)
export async function deleteUserListItemFromDB(identifier) {
  const token = Auth.getUserToken();

  if (!token || !identifier) {
    throw new Error("Token or identifier is missing");
  }

  await Api.postData("/delete-user-list-item", { identifier }, token);
}

export async function updateUserListItemInDB(identifier, updatedItem) {
  const token = Auth.getUserToken();

  if (!token || !identifier || !updatedItem) {
    throw new Error("Token, identifier or updatedItem is missing");
  }

  await Api.postData("/update-user-list-item", { identifier, updatedItem }, token);
}

export async function deleteOldAndCreateNewList() {
    const token = Auth.getUserToken();
    return await Api.postData("/delete-old-and-create-new-list", {}, token);
}

////////////////// END USER LIST ITEMS /////////////////

// ------------------------------------------------------------------

