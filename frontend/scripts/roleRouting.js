import * as Auth from './auth.js';
import * as Storage from './storage.js';
import * as Swipe from './swipetodelete.js';
import * as Meals from './js-pages/meals.js';

export function renderUserRoleColors() {
    const user = Auth.getUserFromToken();

    const roleColors = {
        user: "#1BCE86",
        cook: "#7F8DFF",
        admin: "#E35252"
    };

    // switch case user/cook/admin
    switch (user.role) {
        case 'user':
            document.documentElement.style.setProperty('--accent-color', roleColors.user);
            break;
        case 'cook':
            document.documentElement.style.setProperty('--accent-color', roleColors.cook);
            break;
        case 'admin':
            document.documentElement.style.setProperty('--accent-color', roleColors.admin);
            break;
        default:
            document.documentElement.style.setProperty('--accent-color', roleColors.user);
    }
}

export function renderAdminPanel() {
    const user = Auth.getUserFromToken();
    const adminPanel = document.getElementById('admin-panel');

    if (user && user.role === 'admin') {
        const homeContainer = document.querySelector("#home-container");
        homeContainer.style.gridTemplateRows = "auto 7vh 1fr";
        adminPanel.classList.remove('hidden-admin-panel');
        
    } else {
        // const homeContainer = document.querySelector("#home-container")
        // homeContainer.style.gridTemplateRows = "18vh auto";
        adminPanel.classList.add('hidden-admin-panel');
    }
}

export function renderCookButtons() {
    const user = Auth.getUserFromToken();

    if (user && (user.role === 'cook' || user.role === 'admin')) {
        const cookButtons = document.querySelectorAll('.add-item-p');
        cookButtons.forEach(button => {
            button.style.display = 'flex';
        });
    } 
    // else {
    //     const cookButtons = document.querySelectorAll('.add-item-p');
    //     cookButtons.forEach(button => {
    //         button.style.display = 'none';
    //     });
    // }
}

export function allowSwipeForCook() {
    if (Auth.requiredUserRole('cook') || Auth.requiredUserRole('admin')) {
        const ingredientslist = document.getElementById('ingredients-list-p');
        let ingredientCard = '.ingredient-card-p'
        if (ingredientslist) {
            Swipe.initializeSwipeToDelete(ingredientslist, ingredientCard, deleteIngredient);
        }
    }

    if (Auth.requiredUserRole('cook') || Auth.requiredUserRole('admin')) {
        const dishlist = document.querySelector('#dishes-list-p');
        let dishCard = '.dish-card-p'
        if (dishlist) {
            Swipe.initializeSwipeToDelete(dishlist, dishCard, deleteIDish);
        }
    }
}

function deleteIngredient(id){
    Meals.deleteIngredientCounter();
    Storage.deleteIngredientFromDB(id);
}


function deleteIDish(id){
    Meals.deleteDishCounter();
    Storage.deleteDishFromDB(id);
}