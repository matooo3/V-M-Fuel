// ./pages/list.js
import * as Storage from '../storage.js';
import { loadHTMLTemplate } from '../templateLoader.js';

// Main function
export default async function loadList() {
    const app = document.getElementById('app');
    // LOAD app html-code
    const html = await loadHTMLTemplate('/frontend/html-pages/list.html');
    app.innerHTML = html;


    // ingredients = await getAllDishIngredients()
    // updateList(ingredients); 

    // Add event listener 

    // add event listener to settings class
    const settingsButton = document.querySelector('.settings');
    settingsButton.addEventListener('click', function () {
        window.location.href = '/frontend/html-pages/settings.html';
    });

    const filterButtons = document.querySelectorAll('#filter-bar button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveFilterButton(button);
        });
    });

    document.getElementById("add-item-btn").addEventListener("click", () => {

        // only allow to open it once:
        const existingItem = document.getElementById('newItem');
        if (!existingItem) {
            addItemToList();
        }

    });

    // Load existing items from storage
    // const items = Storage.getGroceryListItems();
    // items.forEach(item => addItem(item));
    // Add event listeners for quantity control buttons
    const list = document.querySelector('.grocery-list');

    list.addEventListener('click', changeAmount);


    // NEU: Initialisiert die komplette Swipe-Logik für die Liste
    initializeSwipeToDelete(list);
}

function addItem(item) {
    const list = document.querySelector('.grocery-list');
    const li = document.createElement('li');
    li.className = 'grocery-item drop-shadow';

    // NEUE HTML-STRUKTUR: Notwendig für die Swipe-Animation.
    // Der Inhalt wird in '.swipe-content' gepackt und ein '.swipe-delete' Button hinzugefügt.
    li.innerHTML = `
        <div class="swipe-delete">Delete</div>
        <div class="swipe-content">
            <input class="checkbox checkbox-gl" type="checkbox" />
            <div class="item-details">
                <h3>${item.name}</h3>
                <span class="category subtext">${item.category}</span>
            </div>
            <div class="quantity-control">
                <button class="minus-btn"><img src="/frontend/assets/icons/minus.png" alt="-"></button>
                <span class="amount">${item.amount}</span><span class="unit">${item.unit}</span>
                <button class="plus-btn"><img src="/frontend/assets/icons/plus.png" alt="+"></button>
            </div>
        </div>
    `;
    list.insertBefore(li, list.firstChild);
}


function addItemToList() {
    // Save item to storage
    // Storage.addGroceryListItem(item);
    // // Add item to the list in the UI

    const list = document.querySelector('.grocery-list');

    const newItem = document.createElement('li');

    newItem.id = 'newItem';
    newItem.className = 'grocery-item drop-shadow';
    // Hier soll input felder kommen wo user das item eingeben kann
    newItem.innerHTML = `
    <div id="new-item-container">
        <div class="item-details-add">
            <input type="text" placeholder="Item Name" />
            <select>
                <option value="Protein">Protein</option>
                <option value="Fruit">Fruit</option>
                <option value="Dairy">Dairy</option>
            </select>
        </div>
        <div class="quantity-control-add">
            <input type="number" placeholder="100" />
            <select>
                <option value="g">g</option>
                <option value="pcs">pcs</option>
                <option value="ml">ml</option>
            </select>
        </div>
    </div>
    <div class="buttons-container">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
    </div>
    `;

    // Als erstes Kind einfügen:
    list.insertBefore(newItem, list.firstChild);

    // Füge Event Listener für die Buttons hinzu
    const saveBtn = newItem.querySelector('.save-btn');
    const cancelBtn = newItem.querySelector('.cancel-btn');
    saveBtn.addEventListener('click', saveNewItem);
    cancelBtn.addEventListener('click', deleteNewItemForm);



}

function saveNewItem() {
    // nehme ale input felder von user
    const newItemContainer = document.getElementById('new-item-container');
    const itemName = newItemContainer.querySelector('input[type="text"]').value;
    const amount = newItemContainer.querySelector('input[type="number"]').value;
    const selects = newItemContainer.querySelectorAll('select');
    const category = selects[0].value;
    const unit = selects[1].value;

    // Erstelle neues Item-Objekt
    const newItem = {
        id: Date.now(),
        name: itemName,
        category: category,
        amount: parseInt(amount, 10),
        unit: unit
    };
    // Speichere das neue Item in der Storage
    // Storage.addGroceryListItem(newItem);

    // Füge das neue Item zur Liste hinzu, aber erst, wenn alles eingegeben wurde
    if (itemName && amount && category && unit) {
        addItem(newItem);
    } else {
        return;
    }



    // Entferne das Eingabeformular
    deleteNewItemForm();

    // // Aktualisiere die Liste
    // updateGroceryList();
    // // Zeige eine Erfolgsmeldung an
    // const successMessage = document.createElement('div');
    // successMessage.className = 'success-message';
    // successMessage.textContent = 'Item successfully added!';
    // document.body.appendChild(successMessage);

}

function deleteNewItemForm() {
    const newItem = document.getElementById('newItem');
    if (newItem) {
        newItem.remove();
    }
}


function changeAmount(event) {
    // NEU: Verhindert, dass beim Klick auf "Delete" die Menge geändert wird.
    if (event.target.closest('.swipe-delete')) return;

    const btn = event.target.closest('button');
    // NEU: Genauerer Check, ob der Button wirklich im quantity-control ist.
    if (!btn || !btn.closest('.quantity-control')) return;
    event.preventDefault();

    // NEU: Selektor auf '.swipe-content' geändert, da dies der neue Container ist.
    const itemEl = btn.closest('.swipe-content');
    const amountSpan = itemEl.querySelector('.amount');
    if (!amountSpan) return;
    let amount = parseInt(amountSpan.textContent, 10);

    if (btn.classList.contains('plus-btn')) {
        amountSpan.textContent = amount + 1;
    } else if (btn.classList.contains('minus-btn') && amount > 1) {
        amountSpan.textContent = amount - 1;
    }
}


// -----------------------------------------------------------
// active class for BUTTONS in filter-bar
// -----------------------------------------------------------

function setActiveFilterButton(button) {
    const buttons = document.querySelectorAll('#filter-bar button');
    buttons.forEach(btn => {
        if (btn === button) {
            btn.classList.add('active');
            btn.classList.remove('notActive');
        } else {
            btn.classList.remove('active');
            btn.classList.add('notActive');
        }
    });
}

// -----------------------------------------------------------
// --------------------- SWIPE TO DELETE ---------------------
// -----------------------------------------------------------

function initializeSwipeToDelete(container) {
    let isSwiping = false;
    let startX = 0;
    let currentX = 0;
    let swipedItem = null;
    let swipedContent = null;

    const deleteButtonWidth = 90;
    const fullSwipeThreshold = 150;

    const deleteItem = (itemToDelete) => {
        if (!itemToDelete) return;

        itemToDelete.style.maxHeight = `${itemToDelete.offsetHeight}px`;
        requestAnimationFrame(() => {
            itemToDelete.classList.add('deleting');
        });

        itemToDelete.addEventListener('transitionend', () => {
            itemToDelete.remove();
            // Hier Logik zum Entfernen aus dem Storage einfügen
            // z.B. Storage.removeGroceryListItem(itemId);
        }, { once: true });
    };

    const closeAllOtherItems = (currentItem) => {
        container.querySelectorAll('.grocery-item').forEach(item => {
            if (item !== currentItem) {
                const content = item.querySelector('.swipe-content');
                if (content) content.style.transform = 'translateX(0)';
            }
        });
    };

    const onSwipeStart = (e) => {
        // if (e.target.closest('button') || e.target.closest('.quantity-control')) return;
        const item = e.target.closest('.grocery-item');
        if (!item || item.id === 'newItem' || e.target.classList.contains('swipe-delete')) return;

        closeAllOtherItems(item);
        isSwiping = true;
        swipedItem = item;
        swipedContent = item.querySelector('.swipe-content');
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = startX;
        swipedContent.style.transition = 'none';
    };

    const onSwipeMove = (e) => {
        if (!isSwiping || !swipedContent) return;

        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        let diffX = currentX - startX;

        if (diffX > 0) diffX = 0;

        swipedContent.style.transform = `translateX(${diffX}px)`;
    };

    const onSwipeEnd = () => {
        if (!isSwiping || !swipedContent) return;

        isSwiping = false;
        let diffX = currentX - startX;
        swipedContent.style.transition = 'transform 0.3s ease-out';

        if (diffX < -fullSwipeThreshold) {
            swipedContent.style.transform = `translateX(-100%)`;
            swipedContent.addEventListener('transitionend', () => deleteItem(swipedItem), { once: true });
        } else if (diffX < -(deleteButtonWidth / 3)) {
            swipedContent.style.transform = `translateX(-${deleteButtonWidth}px)`;
        } else {
            swipedContent.style.transform = 'translateX(0)';
        }
    };

    const onDeleteClick = (e) => {
        if (e.target.classList.contains('swipe-delete')) {
            const itemToDelete = e.target.closest('.grocery-item');
            deleteItem(itemToDelete);
        }
    };

    container.addEventListener('mousedown', onSwipeStart);
    document.addEventListener('mousemove', onSwipeMove);
    document.addEventListener('mouseup', onSwipeEnd);

    container.addEventListener('touchstart', onSwipeStart, { passive: true });
    document.addEventListener('touchmove', onSwipeMove, { passive: true });
    document.addEventListener('touchend', onSwipeEnd);

    container.addEventListener('click', onDeleteClick);
}
// --------------------- END SWIPE TO DELETE ---------------------
