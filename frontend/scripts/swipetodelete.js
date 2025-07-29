export function initializeSwipeToDelete(container, card, removeFromDB) {
    let isSwiping = false;
    let startX = 0;
    let currentX = 0;
    let swipedItem = null;
    let swipedContent = null;
    let deleteButton = null;

    // Cooldown state and duration (handled purely in JS)
    let isDeletionCooldownActive = false;
    const cooldownDuration = 500; // 0.5 seconds

    const deleteButtonWidth = 90;
    const fullSwipeThreshold = 150;

    // Helper function to start the cooldown timer
    const startCooldown = () => {
        isDeletionCooldownActive = true;
        setTimeout(() => {
            isDeletionCooldownActive = false;
        }, cooldownDuration);
    };

    // Function to handle the item deletion logic and animation
    const deleteItem = async (itemToDelete) => {
        if (!itemToDelete) return;

        // Set initial height for smooth collapse animation
        itemToDelete.style.maxHeight = `${itemToDelete.offsetHeight}px`;
        requestAnimationFrame(() => {
            itemToDelete.classList.add('deleting');
        });

        // Listen for the end of the transition to remove the item
        itemToDelete.addEventListener('transitionend', async () => {
            let itemIdElement = itemToDelete.querySelector('.item-id');
            // Removing the element from the DOM should happen here,
            // after the DB action is complete.
            itemToDelete.remove();
            if (itemIdElement) {
                let id = parseInt(itemIdElement.textContent, 10);
                if(id) {
                    await removeFromDB(id); // Call the async database removal function
                } else {
                    await removeFromDB(itemIdElement.textContent);
                }
            }
        }, { once: true });
    };
    
    // Resets any other opened swipe items
    const closeAllOtherItems = (currentItem) => {
        container.querySelectorAll(card).forEach(item => {
            if (item !== currentItem) {
                const content = item.querySelector('.swipe-content');
                const deleteBtn = item.querySelector('.swipe-delete');
                if (content) {
                    content.style.transform = 'translateX(0)';
                    content.style.borderRadius = '0px';
                }
                if (deleteBtn) {
                    deleteBtn.style.width = '0px';
                    deleteBtn.style.opacity = '0';
                }
            }
        });
    };

    // Dynamically updates the delete button's width as the user swipes
    const updateDeleteButton = (diffX) => {
        if (!deleteButton) return;
        const revealedWidth = Math.abs(diffX);
        if (revealedWidth > 0) {
            deleteButton.style.width = `${revealedWidth}px`;
            deleteButton.style.opacity = '1';
        } else {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
        }
    };

    // Event handler for when a swipe starts (mousedown or touchstart)
    const onSwipeStart = (e) => {
        // Prevent starting a new swipe if the cooldown is active
        if (isDeletionCooldownActive) return;

        const item = e.target.closest(card);
        // Ignore clicks on buttons or if it's not a valid swipe target
        if (!item || e.target.closest('button') || e.target.closest('object') || e.target.classList.contains('swipe-delete')) return;
        
        closeAllOtherItems(item);
        isSwiping = true;
        swipedItem = item;
        swipedContent = item.querySelector('.swipe-content');
        deleteButton = item.querySelector('.swipe-delete');
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = startX;

        // Disable transitions during the swipe for direct control
        if (deleteButton) {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
            deleteButton.style.transition = 'none';
        }
        if (swipedContent) {
            swipedContent.style.transition = 'none';
        }
    };
    
    // Event handler for when the user moves their finger/mouse
    const onSwipeMove = (e) => {
        if (!isSwiping || !swipedContent) return;
        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        let diffX = currentX - startX;
        if (diffX > 0) diffX = 0; // Only allow swiping left
        swipedContent.style.transform = `translateX(${diffX}px)`;
        updateDeleteButton(diffX);
    };

    // Event handler for when the swipe ends (mouseup or touchend)
    const onSwipeEnd = () => {
        if (!isSwiping || !swipedContent) return;

        isSwiping = false; // Reset state immediately

        let diffX = currentX - startX;
        
        // Re-enable transitions for the snap-back or slide-out animation
        swipedContent.style.transition = 'transform 0.3s ease-out, border-radius 0.3s ease-out';
        if (deleteButton) {
            deleteButton.style.transition = 'width 0.3s ease-out, opacity 0.3s ease-out';
        }

        // Case 1: Swipe was far enough to trigger a delete
        if (diffX < -fullSwipeThreshold) {
            // Start the cooldown immediately!
            startCooldown();
            
            swipedContent.style.transform = `translateX(-100%)`;
            swipedContent.style.borderRadius = '0 0 0 0';
            if (deleteButton) {
                deleteButton.style.width = '100%';
                deleteButton.style.opacity = '1';
            }
            // The `transitionend` event will now call the `deleteItem` function
            swipedContent.addEventListener('transitionend', () => deleteItem(swipedItem), { once: true });

        // Case 2: Swipe just enough to reveal the button
        } else if (diffX < -(deleteButtonWidth / 3)) { 
            swipedContent.style.transform = `translateX(-${deleteButtonWidth}px)`;
            swipedContent.style.borderRadius = '0 0 0 0';
            if (deleteButton) {
                deleteButton.style.width = `${deleteButtonWidth}px`;
                deleteButton.style.opacity = '1';
            }
        // Case 3: Swipe not far enough, reset to original position
        } else { 
            swipedContent.style.transform = 'translateX(0)';
            swipedContent.style.borderRadius = '0px';
            if (deleteButton) {
                deleteButton.style.width = '0px';
                deleteButton.style.opacity = '0';
            }
        }
    };

    // Event handler for clicking the revealed "Delete" button
    const onDeleteClick = (e) => {
        // Prevent click if cooldown is active
        if (isDeletionCooldownActive) return;

        if (e.target.classList.contains('swipe-delete')) {
            const itemToDelete = e.target.closest(card);
            
            // Start the cooldown immediately!
            startCooldown();

            deleteItem(itemToDelete);
        }
    };

    // Attach all event listeners
    container.addEventListener('mousedown', onSwipeStart);
    document.addEventListener('mousemove', onSwipeMove);
    document.addEventListener('mouseup', onSwipeEnd);
    container.addEventListener('touchstart', onSwipeStart, { passive: true });
    document.addEventListener('touchmove', onSwipeMove, { passive: true });
    document.addEventListener('touchend', onSwipeEnd);
    container.addEventListener('click', onDeleteClick);
}