// ./pages/list.js
import * as Storage from '../storage.js';
import { loadHTMLTemplate } from '../templateLoader.js';
import { CustomSelect } from '/frontend/scripts/drop-down.js';

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
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            window.location.href = '/frontend/html-pages/settings.html';
        });
    }

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
                <button class="minus-btn"><img src="/frontend/assets/icons/minus.svg" alt="-"></button>
                <span class="amount">${item.amount}</span><span class="unit">${item.unit}</span>
                <button class="plus-btn"><img src="/frontend/assets/icons/plus.svg" alt="+"></button>
            </div>
        </div>
    `;
    list.insertBefore(li, list.firstChild)
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
            <input id="name-gl" type="text" placeholder="Item Name" />
            <div class="custom-select">
                <div class="select-trigger">
                    <span class="select-text">Protein</span>
                    <div class="select-arrow"></div>
                </div>
                <div class="select-dropdown">
                    <div class="select-option" data-value="Protein">Protein</div>
                    <div class="select-option" data-value="Fruit">Fruit</div>
                    <div class="select-option" data-value="Dairy">Dairy</div>
                </div>
            </div>
        </div>
        <div class="quantity-control-add">
            <input id="number-gl" type="number" placeholder="100" />
            <div class="custom-select">
                <div class="select-trigger">
                    <span class="select-text">Select Unit</span>
                    <div class="select-arrow"></div>
                </div>
                <div class="select-dropdown">
                    <div class="select-option" data-value="g">g</div>
                    <div class="select-option" data-value="pcs">pcs</div>
                    <div class="select-option" data-value="ml">ml</div>
                </div>
            </div>
        </div>
    </div>
    <div class="buttons-container">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
    </div>
    `;

    // Als erstes Kind einfügen:
    list.insertBefore(newItem, list.firstChild);

    // Initialize custom select
    const customSelects = newItem.querySelectorAll('.custom-select');
    customSelects.forEach(selectElement => {
        new CustomSelect(selectElement);
    });

    // Füge Event Listener für die Buttons hinzu
    const saveBtn = newItem.querySelector('.save-btn');
    const cancelBtn = newItem.querySelector('.cancel-btn');
    saveBtn.addEventListener('click', saveNewItem);
    cancelBtn.addEventListener('click', deleteNewItemForm);



}

function saveNewItem() {
    const newItemContainer = document.getElementById('new-item-container');
    const itemName = newItemContainer.querySelector('input[type="text"]').value;
    const amount = newItemContainer.querySelector('input[type="number"]').value;

    // Get values from the custom selects by reading the displayed text
    const customSelects = newItemContainer.querySelectorAll('.custom-select');
    const categoryText = customSelects[0].querySelector('.select-text').textContent;
    const unitText = customSelects[1].querySelector('.select-text').textContent;

    // Check if actual values were selected (not the default placeholder text)
    const category = (categoryText !== 'Select Category' && categoryText !== 'Protein') ? categoryText : categoryText;
    const unit = (unitText !== 'Select Unit' && unitText !== 'g') ? unitText : unitText;

    // Create new item object
    const newItem = {
        id: Date.now(),
        name: itemName,
        category: category,
        amount: parseInt(amount, 10),
        unit: unit
    };

    // Save the new item to storage (uncomment when ready)
    // Storage.addGroceryListItem(newItem);

    // Add the new item to the list, but only if all fields are filled
    if (itemName && amount && category && unit) {
        addItem(newItem);
        // Remove the input form
        deleteNewItemForm();
    } else {
        alert('Please fill out all fields!'); // Optional: Error message
        return;
    }

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
    let deleteButton = null;

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
            // Here add logic to remove from storage
            // e.g. Storage.removeGroceryListItem(itemId);
        }, { once: true });
    };

    const closeAllOtherItems = (currentItem) => {
        container.querySelectorAll('.grocery-item').forEach(item => {
            if (item !== currentItem) {
                const content = item.querySelector('.swipe-content');
                const deleteBtn = item.querySelector('.swipe-delete');
                if (content) {
                    content.style.transform = 'translateX(0)';
                    // Reset border radius when closing
                    content.style.borderRadius = '15px';
                }
                if (deleteBtn) {
                    // Reset delete button
                    deleteBtn.style.width = '0px';
                    deleteBtn.style.opacity = '0';
                }
            }
        });
    };

    const updateDeleteButton = (diffX) => {
        if (!deleteButton) return;

        const revealedWidth = Math.abs(diffX);

        if (revealedWidth > 10) { // Start showing after 10px of swipe
            deleteButton.style.width = `${revealedWidth}px`;
            deleteButton.style.opacity = '1';
        } else {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
        }
    };


    const updateBorderRadius = (diffX) => {
        if (!swipedContent) return;

        const revealedWidth = Math.abs(diffX);

        if (revealedWidth > 5) {
            // When swiping left, only remove the right border radius
            // Keep the left border radius intact to maintain the visual border
            swipedContent.style.borderRadius = '15px 0 0 15px';
            // Also ensure the content doesn't get clipped on the left
            swipedContent.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
        } else {
            // Restore full border radius when not swiping
            swipedContent.style.borderRadius = '15px';
            swipedContent.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
        }
    };

    const onSwipeStart = (e) => {
        const item = e.target.closest('.grocery-item');
        if (!item || item.id === 'newItem' || e.target.classList.contains('swipe-delete')) return;

        closeAllOtherItems(item);
        isSwiping = true;
        swipedItem = item;
        swipedContent = item.querySelector('.swipe-content');
        deleteButton = item.querySelector('.swipe-delete');
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = startX;

        // Prepare the delete button
        if (deleteButton) {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
            deleteButton.style.transition = 'none';
        }

        // Apply transition to the sliding content only
        swipedContent.style.transition = 'none';
    };

    const onSwipeMove = (e) => {
        if (!isSwiping || !swipedContent) return;

        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        let diffX = currentX - startX;

        if (diffX > 0) diffX = 0;

        // Transform the content
        swipedContent.style.transform = `translateX(${diffX}px)`;

        // Update delete button width to match revealed space
        updateDeleteButton(diffX);

        // Update border radius based on swipe position
        updateBorderRadius(diffX);
    };

    const onSwipeEnd = () => {
        if (!isSwiping || !swipedContent) return;

        isSwiping = false;
        let diffX = currentX - startX;

        // Apply transition to the sliding content
        swipedContent.style.transition = 'transform 0.3s ease-out, border-radius 0.3s ease-out';

        // Apply transition to delete button
        if (deleteButton) {
            deleteButton.style.transition = 'width 0.3s ease-out, opacity 0.3s ease-out';
        }

        if (diffX < -fullSwipeThreshold) {
            // Swipe the content completely off screen
            swipedContent.style.transform = `translateX(-100%)`;
            swipedContent.style.borderRadius = '15px 0 0 15px'; // Keep right corners square
            if (deleteButton) {
                deleteButton.style.width = '100%';
                deleteButton.style.opacity = '1';
            }
            swipedContent.addEventListener('transitionend', () => deleteItem(swipedItem), { once: true });
        } else if (diffX < -(deleteButtonWidth / 3)) {
            // Partially reveal delete button
            swipedContent.style.transform = `translateX(-${deleteButtonWidth}px)`;
            swipedContent.style.borderRadius = '15px 0 0 15px'; // Right corners square
            if (deleteButton) {
                deleteButton.style.width = `${deleteButtonWidth}px`;
                deleteButton.style.opacity = '1';
            }
        } else {
            // Snap back to original position
            swipedContent.style.transform = 'translateX(0)';
            swipedContent.style.borderRadius = '15px'; // Restore full border radius
            if (deleteButton) {
                deleteButton.style.width = '0px';
                deleteButton.style.opacity = '0';
            }
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
