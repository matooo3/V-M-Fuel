// ./pages/meals.js
import { loadHTMLTemplate } from '../templateLoader.js';

// Main function
export default async function loadMeals() {

    const app = document.getElementById('app');

    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/meals.html');
    app.innerHTML = html;

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
// Add dishes functionality
// -----------------------------------------------------------

function addMealCard(name, calories, time, tags = [], containerId = 'dishes-list-p') {

    const dataId = `meal-${name.toLowerCase().replace(/\s+/g, '-')}`;  

    const tagsHTML = tags.map(tag => `<button class="tag-p">${tag}</button>`).join('');
    
    const cardHTML = `
        <div class="card drop-shadow dish-card-p">
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
                        <svg class="star-icon" viewBox="0 0 24 24">
                            <path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.8 7.1 17l.9-5.5-4-3.9 5.6-.8L12 2z" />
                        </svg>
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
    `;
    
    // Add before other cards
    const container = document.getElementById(containerId);
    container.insertAdjacentHTML('beforeend', cardHTML);
    
    const newCard = container.lastElementChild;
    const likeBtn = newCard.querySelector('.like');
    const dislikeBtn = newCard.querySelector('.dislike');
    
    likeBtn.addEventListener('click', toggleFavorite);
    dislikeBtn.addEventListener('click', toggleRejected);
}





// -----------------------------------------------------------
// Add ingredients functionality
// -----------------------------------------------------------


function addIngredientCard(name, category, containerId = 'ingredients-list-p') {

    const dataId = `ingredient-${name.toLowerCase().replace(/\s+/g, '-')}`;
    
    const cardHTML = `
        <div class="card drop-shadow ingredient-card-p">
            <div class="descr-p">
                <h3 class="title-p">${name}</h3>
                <p class="subtext">${category}</p>
            </div>

            <div class="preference-buttons">
                <button class="like" data-meal="${dataId}">
                    <svg class="star-icon" viewBox="0 0 24 24">
                        <path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.8 7.1 17l.9-5.5-4-3.9 5.6-.8L12 2z" />
                    </svg>
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
    `;
    
    // Add before other cards
    const container = document.getElementById(containerId);
    container.insertAdjacentHTML('beforeend', cardHTML);
    
    const newCard = container.lastElementChild;
    const likeBtn = newCard.querySelector('.like');
    const dislikeBtn = newCard.querySelector('.dislike');
    
    likeBtn.addEventListener('click', toggleFavorite);
    dislikeBtn.addEventListener('click', toggleRejected);
}