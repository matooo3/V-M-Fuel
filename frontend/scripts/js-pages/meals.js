// ./pages/meals.js
import { loadHTMLTemplate } from '../templateLoader.js';
import * as DropDown from '../drop-down.js';
import * as Storage from '../storage.js';
import { searchULs } from '../searchBar.js';
import * as Role from '../roleRouting.js';
import * as Settings from './settings.js';
import * as Script from '../script.js';

let ingredientsArray = await Storage.getIngredients();
let dishesArray = await Storage.getDishes();

// Main function
export default async function loadMeals() {

    Script.showNavbar();

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('./html-pages/meals.html');
    app.innerHTML = html;

    Settings.loadSavedTheme();

    Role.renderCookButtons();
    Role.renderUserRoleColors();

    // Update ingredients and meals
    ingredientsArray = await Storage.getIngredients();
    dishesArray = await Storage.getDishes();

    //load all dishes and ingredients
    loadDishesAndIngredients();

    Role.allowSwipeForCook();

    // Settings Event Listener
    Settings.loadSettingsEventListener();

    addFilterbarEventlistener();

    DropDown.addDropdownEventlisteners();

    addPreferenceEventlisteners();

    addSearchbarEventlisteners();

    addMealOverlayEventListeners();

    addIngredientOverlayEventListeners();

    const preferences = await Storage.getUserPreferencesFromDB();
    console.warn('Preferences loaded:', preferences);
    renderPreferenceButtons(preferences);
    updateAllCounters();

}

function addFilterbarEventlistener() {

    const filterButtons = document.querySelectorAll('#filter-bar-p button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // reset scroll position
            document.querySelector('#food-p').scrollTop = 0;
            setActiveFilterButton(button);
        });
    });

}

function addPreferenceEventlisteners() {

    // Like-Buttons
    const likeButtons = document.querySelectorAll('.like');
    likeButtons.forEach(button => {
        button.addEventListener('click', toggleFavorite);
    });

    // Dislike-Buttons  
    const dislikeButtons = document.querySelectorAll('.dislike');
    dislikeButtons.forEach(button => {
        button.addEventListener('click', toggleRejected);
    });
}

function addSearchbarEventlisteners() {
    // search bars
    const searchInput = 'search-preferences';
    const searchableLists = ['#dishes-list-p', '#ingredients-list-p'];
    searchULs(searchInput, searchableLists);

    const searchInputIng = 'search-ingredients';
    const ingredientsList = ['#ingredientsContainer'];
    searchULs(searchInputIng, ingredientsList);
}

function addMealOverlayEventListeners() {

    document.getElementById('add-meal-p').addEventListener('click', function (e) {
        showAddMeal();
        Script.showNavOverlay();
    });
    document.getElementById('closeMealBtn').addEventListener('click', function (e) {
        hideAddMeal();
        Script.hideNavOverlay();
    });

    document.getElementById('addBtn-p').addEventListener('click', saveMeal);

    // Tag functionality
    document.getElementById('addTagBtn').addEventListener('click', addTag);
    document.getElementById('tagInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });

    // Close overlay when clicking outside
    document.getElementById('editMealOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            hideAddMeal();
            Script.hideNavOverlay();
        }
    });

    document.getElementById('navOverlay').addEventListener('click', function (e) {
        if (isPreferencePage()) {
            hideAddMeal();
            Script.hideNavOverlay();
        }
    });

    // Allow Enter key to add tags
    document.getElementById('tagInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });

    // Close overlay when clicking outside
    document.getElementById('editMealOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            hideAddMeal();
            Script.hideNavOverlay();
        }
    });
}

function isPreferencePage() {
    const isPreferencePage = document.querySelector('.meals-container') != null;
    return isPreferencePage;
}


function addIngredientOverlayEventListeners() {

    document.getElementById('add-ingredient-p').addEventListener('click', function (e) {
        showAddIngredient();
        Script.showNavOverlay();
    });
    document.getElementById('closeIngredientBtn').addEventListener('click', function(e) {
        hideAddIngredient();
        Script.hideNavOverlay();
    });

    document.getElementById('addIngredientSubmitBtn').addEventListener('click', saveIngredient);

    // Close overlay when clicking outside
    document.getElementById('editIngredientOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            hideAddIngredient();
            Script.hideNavOverlay();
        }
    });

    document.getElementById('navOverlay').addEventListener('click', function (e) {
        hideAddIngredient();
        Script.hideNavOverlay();
    });

}

// Load food content
async function loadDishesAndIngredients() {

    dishesArray.forEach(dish => {
        addMealCard(dish.name, dish.dish_id, dish.total_calories, dish.preparation_time_in_min, JSON.parse(dish.tags));
    });

    ingredientsArray.forEach(ing => {
        addIngredientCard(ing.name, ing.ingredient_id, ing.category);
    });
}

// -----------------------------------------------------------
// active class for BUTTONS in filter-bar
// -----------------------------------------------------------

function setActiveFilterButton(button) {
    const buttons = document.querySelectorAll('#filter-bar-p button');
    buttons.forEach(btn => {
        if (btn === button) {
            filterPreferenceContent(button);

            btn.classList.add('active-p');
            btn.classList.remove('notActive-p');

        } else {

            btn.classList.remove('active-p');
            btn.classList.add('notActive-p');

        }
    });
}

function filterPreferenceContent(button) {
    const ingredients = document.querySelector('#ingredients-preferences');
    const meals = document.querySelector('#meals-preferences');
    const filter = button.textContent.trim();
    const prefIngt = document.getElementById('ingredientsPreferredWhole');
    const blockedIng = document.getElementById('ingredientsBlockedWhole');
    const prefMeal = document.getElementById('mealsPreferredWhole');
    const blockedMeal = document.getElementById('mealsBlockedWhole');

    ingredients.style.display = filter === 'Meals' ? 'none' : '';
    meals.style.display = filter === 'Ingredients' ? 'none' : '';

    // Hide ingredient counters when showing meals
    prefIngt.style.display = filter === 'Meals' ? 'none' : '';
    blockedIng.style.display = filter === 'Meals' ? 'none' : '';

    // Hide meal counters when showing ingredients
    prefMeal.style.display = filter === 'Ingredients' ? 'none' : '';
    blockedMeal.style.display = filter === 'Ingredients' ? 'none' : '';

}


// -----------------------------------------------------------
// Like/Dislike functionality
// -----------------------------------------------------------


function renderPreferenceButtons(preferences) {
    // load preferences from db (IDs)
    const blockedDishes = preferences.blockedDishes;
    const blockedIngredients = preferences.blockedIngredients;
    const preferredDishes = preferences.preferredDishes;
    const preferredIngredients = preferences.preferredIngredients;

    const dishList = document.querySelectorAll('.dish-card-p');
    const ingredientList = document.querySelectorAll('.ingredient-card-p');

    renderDishListPreferences(dishList, preferredDishes, blockedDishes);

    renderIngredientListPreferences(ingredientList, preferredIngredients, blockedIngredients);

}

function renderDishListPreferences(dishList, preferredDishes, blockedDishes) {
    dishList.forEach(dish => {
        const dishId = dish.querySelector('.item-id').textContent.trim();
        const likeButton = dish.querySelector('.like');
        const dislikeButton = dish.querySelector('.dislike');

        if (preferredDishes.includes(parseInt(dishId, 10))) {
            likeButton.classList.add('favorited');
        }
        if (blockedDishes.includes(parseInt(dishId, 10))) {
            dislikeButton.classList.add('rejected');
        }
    });
}

function renderIngredientListPreferences(ingredientList, preferredIngredients, blockedIngredients) {
    ingredientList.forEach(ingredient => {
        const ingredientId = ingredient.querySelector('.item-id').textContent.trim();
        const likeButton = ingredient.querySelector('.like');
        const dislikeButton = ingredient.querySelector('.dislike');

        if (preferredIngredients.includes(parseInt(ingredientId, 10))) {
            likeButton.classList.add('favorited');
        }
        if (blockedIngredients.includes(parseInt(ingredientId, 10))) {
            dislikeButton.classList.add('rejected');
        }
    });
}

function splitDataId(dataId) {
    const [type, idStr] = dataId.split('-');
    const id = parseInt(idStr, 10);

    if (!type || isNaN(id)) {
        throw new Error(`Invalid dataId format: ${dataId}`);
    }

    return [type, id];
}


async function toggleFavorite(event) {
    const button = event.currentTarget;
    const mealId = button.dataset.meal;

    const [type, id] = splitDataId(mealId);

    const ingredient = type === "ingredient";
    const meal = type === "dish";

    button.classList.toggle('favorited');

    // Deactivate dislike button if like button is activated
    if (button.classList.contains('favorited')) {
        const dislikeButton = document.querySelector(`[data-meal="${mealId}"].dislike`);
        if (dislikeButton && dislikeButton.classList.contains('rejected')) {
            dislikeButton.classList.remove('rejected');
            updateCounter('rejected', false, ingredient, meal); // Remove from rejected (combined case)
        }
        updateCounter('favorited', true, ingredient, meal); // Add to favorited

        Storage.setUserPreference(type, id, 'like')
            .catch((err) => console.error("Failed to update preference:", err)); // add to db
    } else {
        updateCounter('favorited', false, ingredient, meal); // Remove from favorited

        Storage.setUserPreference(type, id, 'neutral')
            .catch((err) => console.error("Failed to update preference:", err)); // remove from db
    }
}

function toggleRejected(event) {
    const button = event.currentTarget;
    const mealId = button.dataset.meal;

    const [type, id] = splitDataId(mealId);

    const ingredient = type === "ingredient";
    const meal = type === "dish";

    button.classList.toggle('rejected');

    // Deactivate like button if dislike button is activated
    if (button.classList.contains('rejected')) {
        const likeButton = document.querySelector(`[data-meal="${mealId}"].like`);
        if (likeButton && likeButton.classList.contains('favorited')) {
            likeButton.classList.remove('favorited');
            updateCounter('favorited', false, ingredient, meal); // Remove from favorited (combined case)
        }
        updateCounter('rejected', true, ingredient, meal); // Add to rejected

        Storage.setUserPreference(type, id, 'dislike')
            .catch((err) => console.error("Failed to update preference:", err)); // add to db
    } else {
        updateCounter('rejected', false, ingredient, meal); // Remove from rejected

        Storage.setUserPreference(type, id, 'neutral')
            .catch((err) => console.error("Failed to update preference:", err)); // remove from db
    }
}

function updateCounter(type, isAdding, ingredient, meal) {

    if (ingredient) {
        const prefElement = document.getElementById('ingredientsPreferred');
        const blockedElement = document.getElementById('ingredientsBlocked');

        if (type === 'favorited') {
            updateElementCounter(prefElement, isAdding, 'ingredientsPreferred');
        } else if (type === 'rejected') {
            updateElementCounter(blockedElement, isAdding, 'ingredientsBlocked');
        }
    } else if (meal) {
        const prefElement = document.getElementById('mealsPreferred');
        const blockedElement = document.getElementById('mealsBlocked');

        if (type === 'favorited') {
            updateElementCounter(prefElement, isAdding, 'mealsPreferred');
        } else if (type === 'rejected') {
            updateElementCounter(blockedElement, isAdding, 'mealsBlocked');
        }
    }
}

function updateCounters(itemType) {
    const config = {
        dish: {
            selector: '.dish-card-p',
            counters: {
                preferred: 'mealsPreferred',
                blocked: 'mealsBlocked'
            }
        },
        ingredient: {
            selector: '.ingredient-card-p',
            counters: {
                preferred: 'ingredientsPreferred',
                blocked: 'ingredientsBlocked'
            }
        }
    };

    const typeConfig = config[itemType];
    if (!typeConfig) {
        console.error(`Invalid item type: ${itemType}`);
        return;
    }

    // Count all currently favorited and rejected items
    const items = document.querySelectorAll(typeConfig.selector);
    let preferredCount = 0;
    let blockedCount = 0;

    items.forEach(item => {
        const likeButton = item.querySelector('.like');
        const dislikeButton = item.querySelector('.dislike');

        if (likeButton?.classList.contains('favorited')) {
            preferredCount++;
        }
        if (dislikeButton?.classList.contains('rejected')) {
            blockedCount++;
        }
    });

    // Update counter displays
    const preferredElement = document.getElementById(typeConfig.counters.preferred);
    const blockedElement = document.getElementById(typeConfig.counters.blocked);

    if (preferredElement) {
        preferredElement.textContent = preferredCount;
    }
    if (blockedElement) {
        blockedElement.textContent = blockedCount;
    }
}

// Exported functions that simply recount everything
export function deleteDishCounter() {
    updateCounters('dish');
}

export function deleteIngredientCounter() {
    updateCounters('ingredient');
}

function updateAllCounters() {
    updateCounters('dish');
    updateCounters('ingredient');
}

function updateElementCounter(element, isAdding) {
    if (element) {
        const currentValue = Number(element.textContent) || 0;
        const newValue = isAdding ? currentValue + 1 : currentValue - 1;
        element.textContent = Math.max(0, newValue);

        // element.textContent = finalValue;

        // local storage key must be defined and given to the function!!!
        // Save to localStorage
        // localStorage.setItem(storageKey, finalValue.toString());

    }
}



// -----------------------------------------------------------
// Overlay
// -----------------------------------------------------------

// Ingredients search
async function loadIngredients() {
    const list = document.getElementById('ingredientsContainer');
    ingredientsArray.forEach(ingredient => {
        const uom = extractUnit(ingredient.Unit_of_Measurement);
        list.innerHTML += `
    <li class="card ingredient">
            <input class="checkbox-overlay" type="checkbox">
            <span class="ingredient-text-p">${ingredient.name}</span>
            <div class="ingredient-amount-p">
                <input type="number" class="form-input ingredient" placeholder="0">
                <span class="amount-text-p">${uom}</span>
            </div>
    </li>
  `;
    });
}

function extractUnit(uom) {
    if (!uom) return '';
    return uom.replace(/[0-9]/g, '').toLowerCase();
}

function getCheckedIngredientData() {
    const checkboxes = document.querySelectorAll('#ingredientsContainer .checkbox-overlay');
    const checkedData = [];

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {

            // get parent li element
            const ingredientItem = checkbox.closest('.card.ingredient');

            // get input field
            const numberInput = ingredientItem.querySelector('.form-input.ingredient');
            const amount = parseFloat(numberInput.value) || 0;

            // [index, amount]
            checkedData.push([index, amount]);
        }
    });

    return checkedData;
}

function calculateIngredientsData() {

    const checkedData = getCheckedIngredientData();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let ingredients = [];

    checkedData.forEach(tuple => {

        const [indexIng, amount] = tuple;
        totalCalories += ingredientsArray[indexIng].calories_per_UoM / 100 * amount;
        totalProtein += ingredientsArray[indexIng].protein_per_UoM / 100 * amount;
        totalCarbs += ingredientsArray[indexIng].carbs_per_UoM / 100 * amount;
        totalFat += ingredientsArray[indexIng].fats_per_UoM / 100 * amount;
        let uom = extractUnit(ingredientsArray[indexIng].Unit_of_Measurement);
        ingredients.push({
            ingredient_id: ingredientsArray[indexIng].ingredient_id,
            unit_of_measurement: uom,
            amount: amount,
        });

    });

    return {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        ingredients: ingredients,
    };

}


// Show and hide Overlays

function showAddMeal() {
    const overlay = document.getElementById('editMealOverlay');
    const formSection = overlay.querySelector('.form-section');
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('hidden');

    if (formSection) {
        formSection.scrollTop = 0;
    }

    loadIngredients();

}

function hideAddMeal() {
    const overlay = document.getElementById('editMealOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

}

function showAddIngredient() {
    const overlay = document.getElementById('editIngredientOverlay');
    const formSectionIng = overlay.querySelector('.form-section-ingredient');
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('hidden');

    if (formSectionIng) {
        formSectionIng.scrollTop = 0;
    }

}

function hideAddIngredient() {
    const overlay = document.getElementById('editIngredientOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}


// Add Tag
function addTag() {
    const tagInput = document.getElementById('tagInput');
    const tagValue = tagInput.value.trim();

    if (tagValue) {
        const tagsContainer = document.getElementById('tagsContainer');
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-o-p';
        tagElement.innerHTML = `
                    <span>${tagValue}</span>
                    <button class="tag-remove">
                    <img src="./assets/icons/remove-tag.svg" alt="">
                    </button>
                `;
        tagsContainer.appendChild(tagElement);
        tagInput.value = '';

        const removeTag = document.querySelector(".tag-remove");
        removeTag.addEventListener("click", function () {
            removeTag.parentElement.remove();
        });
    }
}

function validateMealForm(mealData) {

    // 1. Meal Name
    if (!mealData.name || mealData.name.trim() === '') {
        alert('Please enter a meal name.');
        return false;
    }

    // 2. Time
    if (!mealData.time || isNaN(mealData.time) || parseInt(mealData.time) <= 0) {
        alert('Please enter a valid cooking time (greater than 0).');
        return false;
    }

    // 3. VM Score
    if (!mealData.vmScore || isNaN(mealData.vmScore)) {
        alert('Please enter a valid VM score.');
        return false;
    }

    // 4. Category
    if (!mealData.category || mealData.category === 'Select Category' || mealData.category === 'Protein') {
        alert('Please select a valid category.');
        return false;
    }

    // 5. Cooking Instructions
    if (!mealData.preparation || mealData.preparation.trim() === '') {
        alert('Please enter cooking instructions.');
        return false;
    }

    // 6. Ingredients - at least one
    if (!mealData.ingredients || mealData.ingredients.length === 0) {
        alert('Please select at least one ingredient.');
        return false;
    }

    // 7. Each ingredient must have a valid amount
    for (let ing of mealData.ingredients) {
        if (!ing.amount || isNaN(ing.amount) || parseFloat(ing.amount) <= 0) {
            alert(`Please enter a valid amount for ingredient ID: ${ing.ingredient_id}.`);
            return false;
        }
    }

    return true;
}


// REPLACE the existing addMealCard function with this updated version
function addMealCard(name, dishID, calories, time, tags = [], containerId = '#dishes-list-p') {

    const dataId = `dish-${dishID}`;

    const tagsHTML = tags.map(tag => `<button class="tag-p">${tag}</button>`).join('');

    const cardHTML = `
    <li class="card drop-shadow dish-card-p">
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <span class="item-id">${dishID}</span>
            <div class="first-row-of-dish">
                <div class="descr-p">
                    <h3 class="title-p">${name}</h3>
                    <div class="dish-info-p">
                        <p class="subtext">${calories} ckal</p>
                        <div class="subtext-point"></div>
                        <p class="subtext">${time} min</p>
                    </div>
                </div>
                <div class="preference-buttons">
                    <button class="like" data-meal="${dataId}">
                        <img class="star-icon" src="./assets/icons/star.svg" alt="star">
                    </button>
                    <button class="dislike" data-meal="${dataId}">
                        <svg class="cross-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="tags-container-p">
                ${tagsHTML}
            </div>
        </div>
    </li>
    `;

    // Add before other cards
    const container = document.querySelector(containerId);
    if (!container) return;
    container.insertAdjacentHTML('beforeend', cardHTML);

    const newCard = container.lastElementChild;
    const likeBtn = newCard.querySelector('.like');
    const dislikeBtn = newCard.querySelector('.dislike');

    likeBtn.addEventListener('click', toggleFavorite);
    dislikeBtn.addEventListener('click', toggleRejected);
}

// Save Meal
async function saveMeal() {

    const submitButton = document.getElementById('addBtn-p');
    submitButton.disabled = true;

    // save data variables
    const ingredientData = calculateIngredientsData();

    const name = document.getElementById('mealName-p').value;
    const calories = ingredientData.calories;
    const protein = ingredientData.protein;
    const fat = ingredientData.fat;
    const carbs = ingredientData.carbs;
    const time = document.getElementById('time-p').value;
    const vmScore = document.getElementById('vmScore-p').value;
    let category = document.getElementById('category-p').textContent.trim();
    const tagsArray = Array.from(document.querySelectorAll('.tag-o-p span')).map(tag => tag.textContent);
    const ingredients = ingredientData.ingredients;
    const preparation = document.getElementById('instructions-p').value;

    const tags = JSON.stringify(tagsArray);

    if (category === "lunch/dinner") {
        category = "Main";
    }

    const mealData = {
        name, preparation, vmScore, category, time, calories, protein, fat, carbs, tags, ingredients
    };

    // Validate form
    if (validateMealForm(mealData)) {

        hideAddMeal();

        // Add dish to DB
        const response = await Storage.addNewDishToDB(mealData);
        const dishId = response.dishId;

        // dishesArray = await Storage.getDishes();
        // let lastDish = dishesArray[dishesArray.length - 1];
        // let dishID = lastDish.dish_id;

        // Add dish to UI
        addMealCard(name, dishId, calories, time, tagsArray);

        // hide UI and clear form
        clearMealForm();

    };

    submitButton.disabled = false;
}


function clearMealForm() {
    document.getElementById('mealName-p').value = '';
    document.getElementById('time-p').value = '';
    document.getElementById('vmScore-p').value = '';
    document.getElementById('instructions-p').value = '';

    // Clear tags
    document.getElementById('tagsContainer').innerHTML = '';

    // Clear ingredients
    document.getElementById('ingredientsContainer').innerHTML = '';

    document.getElementById('category-p').textContent = 'breakfast';

    const overlay = document.getElementById('editMealOverlay');
    overlay.scrollTop = 0;

    // Also reset scroll position of the meal card content if it exists
    const mealCard = overlay.querySelector('.add-meal-card');
    if (mealCard) {
        mealCard.scrollTop = 0;
    }
}


// Add ingredients functionality
function addIngredientCard(name, ingredientID, category, containerId = 'ingredients-list-p') {

    const dataId = `ingredient-${ingredientID}`;

    const cardHTML = `
        <li class="card drop-shadow ingredient-card-p">
            <span class="item-id">${ingredientID}</span>
            <div class="swipe-delete">Delete</div>
            <div class="swipe-content">
                <div class="descr-p">
                    <h3 class="title-p">${name}</h3>
                    <p class="subtext">${category}</p>
                </div>

                <div class="preference-buttons">
                    <button class="like" data-meal="${dataId}">
                        <img class="star-icon" src="./assets/icons/star.svg" alt="star">
                    </button>
                    <button class="dislike" data-meal="${dataId}">
                        <svg class="cross-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </li>
    `;

    // Add before other cards
    const container = document.getElementById(containerId);
    // Add a check to prevent errors if the container doesn't exist
    if (!container) return;
    container.insertAdjacentHTML('beforeend', cardHTML);

    const newCard = container.lastElementChild;
    const likeBtn = newCard.querySelector('.like');
    const dislikeBtn = newCard.querySelector('.dislike');

    likeBtn.addEventListener('click', toggleFavorite);
    dislikeBtn.addEventListener('click', toggleRejected);
}

function validateIngredientData(data) {
    // Name
    if (!data.name || data.name.trim() === '') {
        alert('Please enter an ingredient name.');
        document.getElementById('ingredientName-p').focus();
        return false;
    }

    // Category 
    if (!data.category || data.category.trim() === '' || data.category === 'Select Category') {
        alert('Please select a category.');
        document.getElementById('ingredientCategory-p').focus();
        return false;
    }

    // Calories
    if (isNaN(data.calories) || data.calories <= 0) {
        alert('Please enter a valid number for calories (must be greater than 0).');
        document.getElementById('ingredientCalories-p').focus();
        return false;
    }

    // Protein
    if (isNaN(data.protein) || data.protein < 0) {
        alert('Please enter a valid number for protein (0 or more).');
        document.getElementById('ingredientProtein-p').focus();
        return false;
    }

    // Fat 
    if (isNaN(data.fats) || data.fats < 0) {
        alert('Please enter a valid number for fat (0 or more).');
        document.getElementById('ingredientFat-p').focus();
        return false;
    }

    // Carbs 
    if (isNaN(data.carbs) || data.carbs < 0) {
        alert('Please enter a valid number for carbs (0 or more).');
        document.getElementById('ingredientCarbs-p').focus();
        return false;
    }

    // Unit
    if (!data.uom || data.uom.trim() === '' || data.uom === 'Select Unit') {
        alert('Please select a unit.');
        document.getElementById('ingredientUnit-p').focus();
        return false;
    }

    return true;
}

// Save Ingredient
async function saveIngredient() {

    const submitButton = document.getElementById('addIngredientSubmitBtn');
    submitButton.disabled = true;

    // save data variables
    const name = document.getElementById('ingredientName-p').value.trim();
    const category = document.getElementById('ingredientCategory-p').textContent.trim();
    const protein = document.getElementById('ingredientProtein-p').value.trim();
    const fats = document.getElementById('ingredientFat-p').value.trim();
    const carbs = document.getElementById('ingredientCarbs-p').value.trim();
    const calories = document.getElementById('ingredientCalories-p').value.trim();
    const compare = document.getElementById('ingredientUnit-p').textContent.trim();
    let uom = document.getElementById('ingredientUnit-p').textContent.trim();

    if (compare === 'grams' || compare === 'milliliters') {

        uom = `100 ${document.getElementById('ingredientUnit-p').textContent.trim()}`;

    }

    const ingredientData = {
        name,
        uom,
        calories,
        carbs,
        fats,
        protein,
        category
    };

    // Validate data
    if (validateIngredientData(ingredientData)) {

        hideAddIngredient();
        Script.hideNavOverlay();

        const response = await Storage.addNewIngredientToDB(ingredientData);
        const ingredientId = response.ingredientId;

        // Add ingredient to UI
        addIngredientCard(name, ingredientId, category);

        // hide UI and clear form
        clearIngredientForm();
    }

    submitButton.disabled = false;

}

function clearIngredientForm() {
    document.getElementById('ingredientName-p').value = '';
    document.getElementById('ingredientProtein-p').value = '';
    document.getElementById('ingredientFat-p').value = '';
    document.getElementById('ingredientCarbs-p').value = '';
    document.getElementById('ingredientCalories-p').value = '';
    document.getElementById('ingredientCategory-p').textContent = 'fruits';
    document.getElementById('ingredientUnit-p').textContent = 'piece';
}