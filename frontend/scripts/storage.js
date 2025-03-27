import * as api from './api.js';

// generic save-function, so if we change from LS to IndexedDB we can easily modify that here
function saveToLS(key, data) {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
    }
}


// ---------------------- get() ----------------------------------
// get DISHES
async function getDishes() {
  const dishes = await api.fetchData('/dishes');
    // saveToLS('dishes', dishes);
  return dishes;
}


// get DISH INGREDIENTS
async function getDishIngredients() {
    const dishIngredients = await api.fetchData('/dish_ingredients');
    //   saveToLS('dishIngredients', dishIngredients);
    return dishIngredients;
}

// get INGREDIENTS
async function getIngredients() {
  const ingredients = await api.fetchData('/ingredients');
//     saveToLS('ingredients', ingredients);
  return ingredients;
}

// get USERS
async function getUsers() {
  const users = await api.fetchData('/users');
//     saveToLS('users', users);
  return users;
}

// get USER-DISHES
async function getUserDishes() {
  const userDishes = await api.fetchData('/user_dishes');
//     saveToLS('userDishes', userDishes);
  return userDishes;
}


// -----------------------------------END------------------------------------------



// ------------------------------- GET DATA DB (MAIN) -----------------------------
// get ALL DATA (main function)
async function getDataDB() {

    const dishes = await getDishes();
    const ingredients = await getIngredients();
    const users = await getUsers();
    const userDishes = await getUserDishes();
    const dishIngredients = await getDishIngredients();

    const data = { dishes, ingredients, users, userDishes, dishIngredients };


    // data --> json-Format
    // save to LocalStorage
    saveToLS('data', data);


  return data;
}
// -------------------------------------------------------------------------------

// ------------------------------- GET DATA LS (2. MAIN) -------------------------
function getDataLS() {
    const storedData = localStorage.getItem('data');
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
async function getData() { 
    //if internet
    getDataDB();


    //if no internet
    // ....
}
//---------------------------------------------------------------------------------

async function setData() {
    saveToLS();
    saveToDB();
}

// export all
export { getDataDB, getDishes, getIngredients, getUsers, 
         getUserDishes, getDishIngredients, setData, 
         getDataLS, getData };
