// ./pages/meals.js
import { loadHTMLTemplate } from '../templateLoader.js';
import { CustomSelect } from '/frontend/scripts/drop-down.js';
import * as Storage from '../storage.js';
import { initializeSwipeToDelete } from '../swipetodelete.js';

let ingredientsArray = await Storage.getIngredients();
let dishesArray = await Storage.getDishes();

// Main function
export default async function loadMeals() {

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/meals.html');
    app.innerHTML = html;

    //load all dishes and ingredients
    loadDishesAndIngredients();

    const ingredientslist = document.getElementById('ingredients-list-p');
    let ingredientCard = '.ingredient-card-p'
    if (ingredientslist) {
        initializeSwipeToDelete(ingredientslist, ingredientCard, Storage.deleteIngredientFromDB);
    }

    const dishlist = document.querySelector('.dishes-list-p');
    let dishCard = '.dish-card-p'
    if (dishlist){
        initializeSwipeToDelete(dishlist, dishCard, Storage.deleteDishFromDB);
    }

    // Settings Eventlistener
    const settingsButton = document.querySelector('.settings');
    settingsButton.addEventListener('click', function () {
        window.location.href = '/frontend/html-pages/settings.html';
    });

    // filter bar (Meals, Ingredients)
    const filterButtons = document.querySelectorAll('#filter-bar-p button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveFilterButton(button);
        });
    });

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

    //dropdown menu
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(select => {
        new CustomSelect(select);
    });

    // -----------------------------------------------------------
    // Add Meal Overlay
    // -----------------------------------------------------------
    document.getElementById('add-meal-p').addEventListener('click', showEditMeal);
    document.getElementById('closeMealBtn').addEventListener('click', hideEditMeal);
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
            hideEditMeal();
        }
    });

    document.getElementById('navOverlay').addEventListener('click', function (e) {
        hideEditMeal();
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
            hideEditMeal();
        }
    });

    // search bar for ingredients
    const searchInput = document.getElementById('search-ingredients');
    const ingredientsList = document.getElementById('ingredientsContainer');

    searchInput.addEventListener('input', () => {
        searchBar(searchInput, ingredientsList);
    });

    // -----------------------------------------------------------
    // Ingredients Overlay
    // -----------------------------------------------------------
    document.getElementById('add-ingredient-p').addEventListener('click', showEditIngredient);
    document.getElementById('closeIngredientBtn').addEventListener('click', hideEditIngredient);
    document.getElementById('addIngredientSubmitBtn').addEventListener('click', saveIngredient);

    // Close overlay when clicking outside
    document.getElementById('editIngredientOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            hideEditIngredient();
        }
    });

    document.getElementById('navOverlay').addEventListener('click', function (e) {
        hideEditIngredient();
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
            btn.classList.add('active-p');
            btn.classList.remove('notActive-p');
        } else {
            btn.classList.remove('active-p');
            btn.classList.add('notActive-p');
        }
    });
}


// -----------------------------------------------------------
// Like/Dislike functionality
// -----------------------------------------------------------

function toggleFavorite(event) {
    const button = event.currentTarget;
    button.classList.toggle('favorited');

    // Dislike-Button deaktivieren wenn Like aktiviert wird
    if (button.classList.contains('favorited')) {
        const mealId = button.dataset.meal;
        const dislikeButton = document.querySelector(`[data-meal="${mealId}"].dislike`);
        if (dislikeButton) {
            dislikeButton.classList.remove('rejected');
        }
    }
}

function toggleRejected(event) {
    const button = event.currentTarget;
    button.classList.toggle('rejected');

    // Like-Button deaktivieren wenn Dislike aktiviert wird
    if (button.classList.contains('rejected')) {
        const mealId = button.dataset.meal;
        const likeButton = document.querySelector(`[data-meal="${mealId}"].like`);
        if (likeButton) {
            likeButton.classList.remove('favorited');
        }
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
            <input class="checkbox" type="checkbox">
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

function searchBar(searchInput, list) {
    const query = searchInput.value.toLowerCase();
    const items = list.querySelectorAll('li.card.ingredient');

    items.forEach(item => {
        const nameSpan = item.querySelector('.ingredient-text-p');
        const name = nameSpan ? nameSpan.textContent.toLowerCase() : '';
        if (name.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function getCheckedIngredientData() {
    const checkboxes = document.querySelectorAll('#ingredientsContainer .checkbox');
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
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        ingredients: ingredients,
    };
}


// Show and hide Overlays

function showEditMeal() {
    document.getElementById('navOverlay').classList.remove('hidden');
    document.getElementById('editMealOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    loadIngredients();

}

function hideEditMeal() {
    document.getElementById('navOverlay').classList.add('hidden');
    document.getElementById('editMealOverlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showEditIngredient() {
    document.getElementById('navOverlay').classList.remove('hidden');
    document.getElementById('editIngredientOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideEditIngredient() {
    document.getElementById('navOverlay').classList.add('hidden');
    document.getElementById('editIngredientOverlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
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
                    <img src="/frontend/assets/icons/remove-tag.svg" alt="">
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

function validateMealForm() {
    const errors = [];

    // 1. Meal Name validation
    const mealName = document.getElementById('mealName-p').value.trim();
    if (!mealName) {
        errors.push({ field: 'mealName-p', message: 'Please enter a meal name' });
    }

    // 2. Time validation
    const time = document.getElementById('time-p').value.trim();
    if (!time || isNaN(time) || parseInt(time) <= 0) {
        errors.push({ field: 'time-p', message: 'Please enter a valid cooking time' });
    }

    // 3. VM Score validation
    const vmScore = document.getElementById('vmScore-p').value.trim();
    if (!vmScore || isNaN(vmScore)) {
        errors.push({ field: 'vmScore-p', message: 'Please enter a valid VM score' });
    }

    // 4. Category validation
    const category = document.getElementById('category-p').textContent.trim();
    if (!category || category === 'Select Category' || category === 'Protein') {
        errors.push({ field: 'category-p', message: 'Please select a category' });
    }

    // 5. Cooking Instructions validation
    const instructions = document.getElementById('instructions-p').value.trim();
    if (!instructions) {
        errors.push({ field: 'instructions-p', message: 'Please enter cooking instructions' });
    }

    // 6. Ingredients validation - at least one checked
    const checkedCheckboxes = document.querySelectorAll('#ingredientsContainer .checkbox:checked');
    if (checkedCheckboxes.length === 0) {
        errors.push({ field: 'ingredientsContainer', message: 'Please select at least one ingredient' });
    }

    // 7. Validate checked ingredients have amounts
    checkedCheckboxes.forEach((checkbox, index) => {
        const ingredientItem = checkbox.closest('.card.ingredient');
        const amountInput = ingredientItem.querySelector('.form-input.ingredient');
        const amount = amountInput.value.trim();
        const ingredientName = ingredientItem.querySelector('.ingredient-text-p').textContent;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            errors.push({
                field: amountInput,
                message: `Please enter a valid amount for ${ingredientName}`
            });
        }
    });

    return errors;
}


// REPLACE the existing addMealCard function with this updated version
function addMealCard(name, dishID, calories, time, tags = [], containerId = '.dishes-list-p') {

    const dataId = `meal-${name}`;

    const tagsHTML = tags.map(tag => `<button class="tag-p">${tag}</button>`).join('');

    const cardHTML = `
    <div class="card drop-shadow dish-card-p">
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
                        <object class="star-icon" src="/frontend/assets/icons/star.svg" alt="star"></object>
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
    </div>
    `;

    // Add before other cards
    const container = document.querySelector(containerId);
    container.insertAdjacentHTML('beforeend', cardHTML);

    const newCard = container.lastElementChild;
    const likeBtn = newCard.querySelector('.like');
    const dislikeBtn = newCard.querySelector('.dislike');

    likeBtn.addEventListener('click', toggleFavorite);
    dislikeBtn.addEventListener('click', toggleRejected);
}

// Save Meal
function saveMeal() {

    // Validate form
    const validationErrors = validateMealForm();

    if (validationErrors.length > 0) {
        // Show first error and focus field
        const firstError = validationErrors[0];
        alert(firstError.message);

        // Focus the problematic field
        if (typeof firstError.field === 'string') {
            const field = document.getElementById(firstError.field);
            if (field) field.focus();
        } else if (firstError.field.focus) {
            firstError.field.focus(); // For input elements
        }

        return; // Stop execution
    }

    // save data variables
    const ingredientData = calculateIngredientsData();

    const name = document.getElementById('mealName-p').value;
    const calories = ingredientData.calories;
    const protein = ingredientData.protein;
    const fat = ingredientData.fat;
    const carbs = ingredientData.carbs;
    const time = document.getElementById('time-p').value;
    const vmScore = document.getElementById('vmScore-p').value;
    const category = document.getElementById('category-p').textContent.trim();
    const tagsArray = Array.from(document.querySelectorAll('.tag-o-p span')).map(tag => tag.textContent);
    const ingredients = ingredientData.ingredients;
    const preparation = document.getElementById('instructions-p').value;

    const tags = JSON.stringify(tagsArray);

    const mealData = {
        name, preparation, vmScore, category, time, calories, protein, fat, carbs, tags, ingredients
    };

    // Add dish to DB
    Storage.addNewDishToDB(mealData);

    let lastDishId = dishesArray[dishesArray.length-1].dish_id;
    let dishID = lastDishId + 1;

    // Add dish to UI
    addMealCard(name, dishID, calories, time, tagsArray);

    // hide UI and clear form
    hideEditMeal();
    clearForm();
}


function clearForm() {
    document.getElementById('mealName-p').value = '';
    document.getElementById('time-p').value = '';
    document.getElementById('vmScore-p').value = '';
    document.getElementById('instructions-p').value = '';

    // Clear tags
    document.getElementById('tagsContainer').innerHTML = '';

    // Clear ingredients
    document.getElementById('ingredientsContainer').innerHTML = '';

    // Reset category to default
    const categoryElement = document.getElementById('category-p');
    if (categoryElement) {
        categoryElement.textContent = 'Select Category';
    }
}


// Add ingredients functionality
function addIngredientCard(name, ingredientID, category, containerId = 'ingredients-list-p') {

    const dataId = `ingredient-${name}`;

    const cardHTML = `
        <div class="card drop-shadow ingredient-card-p">
            <span style="display: none;">${ingredientID}</span>
            <div class="swipe-delete">Delete</div>
            <div class="swipe-content">
                <div class="descr-p">
                    <h3 class="title-p">${name}</h3>
                    <p class="subtext">${category}</p>
                </div>

                <div class="preference-buttons">
                    <button class="like" data-meal="${dataId}">
                        <object class="star-icon" src="/frontend/assets/icons/star.svg" alt="star"></object>
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
        </div>
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

// validate ingredient data
function validateIngredientData(data) {
    if (!data.name || data.name.trim() === '') {
        alert('Please enter an ingredient name.');
        document.getElementById('ingredientName-p').focus();
        return false;
    }

    if (!data.category || data.category.trim() === '' || data.category === 'Select Category') {
        alert('Please select a category.');
        document.getElementById('ingredientCategory-p').focus();
        return false;
    }

    return true;
}


// Save Ingredient
function saveIngredient() {

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
    validateIngredientData(ingredientData);

    // Add ingredient to DB
    Storage.addNewIngredientToDB(ingredientData);

    let lastIngredientId = ingredientsArray[ingredientsArray.length-1].ingredient_id;
    let ingredientId = lastIngredientId + 1;

    // Add ingredient to UI
    addIngredientCard(ingredientData.name, ingredientId, ingredientData.category);

    // hide UI and clear form
    hideEditIngredient();
    clearIngredientForm();
}

function clearIngredientForm() {
    document.getElementById('ingredientName-p').value = '';
    document.getElementById('ingredientProtein-p').value = '';
    document.getElementById('ingredientFat-p').value = '';
    document.getElementById('ingredientCarbs-p').value = '';
    document.getElementById('ingredientCalories-p').value = '';
    document.getElementById('ingredientCategory-p').textContent = 'Select Category';
}