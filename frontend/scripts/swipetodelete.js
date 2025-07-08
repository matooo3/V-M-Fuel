export function initializeSwipeToDelete(container, card, removeFromDB) {
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
            let id = parseInt(itemToDelete.querySelector('.item-id').value, 10);
            removeFromDB(id);
        }, { once: true });
    };

    const closeAllOtherItems = (currentItem) => {
        container.querySelectorAll(card).forEach(item => {
            if (item !== currentItem) {
                const content = item.querySelector('.swipe-content');
                const deleteBtn = item.querySelector('.swipe-delete');
                if (content) {
                    content.style.transform = 'translateX(0)';
                    content.style.borderRadius = '15px';
                }
                if (deleteBtn) {
                    deleteBtn.style.width = '0px';
                    deleteBtn.style.opacity = '0';
                }
            }
        });
    };

    const updateDeleteButton = (diffX) => {
        if (!deleteButton) return;
        const revealedWidth = Math.abs(diffX);
        if (revealedWidth > 10) {
            deleteButton.style.width = `${revealedWidth}px`;
            deleteButton.style.opacity = '1';
        } else {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
        }
    };

    const onSwipeStart = (e) => {
        const item = e.target.closest(card);
        if (!item || e.target.closest('button') || e.target.closest('object') || e.target.classList.contains('swipe-delete')) return;

        closeAllOtherItems(item);
        isSwiping = true;
        swipedItem = item;
        swipedContent = item.querySelector('.swipe-content');
        deleteButton = item.querySelector('.swipe-delete');
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = startX;

        if (deleteButton) {
            deleteButton.style.width = '0px';
            deleteButton.style.opacity = '0';
            deleteButton.style.transition = 'none';
        }
        if (swipedContent) {
            swipedContent.style.transition = 'none';
        }
    };

    const onSwipeMove = (e) => {
        if (!isSwiping || !swipedContent) return;
        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        let diffX = currentX - startX;
        if (diffX > 0) diffX = 0;
        swipedContent.style.transform = `translateX(${diffX}px)`;
        updateDeleteButton(diffX);
    };

    const onSwipeEnd = () => {
        if (!isSwiping || !swipedContent) return;
        isSwiping = false;
        let diffX = currentX - startX;
        swipedContent.style.transition = 'transform 0.3s ease-out, border-radius 0.3s ease-out';
        if (deleteButton) {
            deleteButton.style.transition = 'width 0.3s ease-out, opacity 0.3s ease-out';
        }
        if (diffX < -fullSwipeThreshold) {
            swipedContent.style.transform = `translateX(-100%)`;
            swipedContent.style.borderRadius = '15px 0 0 15px';
            if (deleteButton) {
                deleteButton.style.width = '100%';
                deleteButton.style.opacity = '1';
            }
            swipedContent.addEventListener('transitionend', () => deleteItem(swipedItem), { once: true });
        } else if (diffX < -(deleteButtonWidth / 3)) {
            swipedContent.style.transform = `translateX(-${deleteButtonWidth}px)`;
            swipedContent.style.borderRadius = '15px 0 0 15px';
            if (deleteButton) {
                deleteButton.style.width = `${deleteButtonWidth}px`;
                deleteButton.style.opacity = '1';
            }
        } else {
            swipedContent.style.transform = 'translateX(0)';
            swipedContent.style.borderRadius = '15px';
            if (deleteButton) {
                deleteButton.style.width = '0px';
                deleteButton.style.opacity = '0';
            }
        }
    };

    const onDeleteClick = (e) => {
        if (e.target.classList.contains('swipe-delete')) {
            const itemToDelete = e.target.closest(card);
            console.log(itemToDelete);
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