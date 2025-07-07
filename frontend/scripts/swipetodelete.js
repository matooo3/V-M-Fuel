class SwipeToDelete {
    constructor(listId, options = {}) {
        this.list = document.getElementById(listId);
        this.options = {
            swipeThreshold: 100,
            animationDuration: 300,
            onDelete: options.onDelete || null,
            ...options
        };
        
        this.init();
    }

    init() {
        if (!this.list) {
            console.error('List element not found');
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        this.list.addEventListener('mousedown', this.handleStart.bind(this));
        this.list.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        
        document.addEventListener('mouseup', this.handleEnd.bind(this));
        document.addEventListener('touchend', this.handleEnd.bind(this));
    }

    handleStart(e) {
        const swipeContent = e.target.closest('.swipe-content');
        if (!swipeContent) return;

        this.activeElement = swipeContent;
        this.startX = this.getClientX(e);
        this.currentX = this.startX;
        this.isDragging = true;

        swipeContent.classList.add('swiping');
        e.preventDefault();
    }

    handleMove(e) {
        if (!this.isDragging || !this.activeElement) return;

        this.currentX = this.getClientX(e);
        const deltaX = this.currentX - this.startX;

        // Only allow left swipes (negative deltaX)
        if (deltaX < 0) {
            const translateX = Math.max(deltaX, -this.options.swipeThreshold * 2);
            this.activeElement.style.transform = `translateX(${translateX}px)`;
        }

        e.preventDefault();
    }

    handleEnd(e) {
        if (!this.isDragging || !this.activeElement) return;

        const deltaX = this.currentX - this.startX;
        const shouldDelete = deltaX < -this.options.swipeThreshold;

        this.activeElement.classList.remove('swiping');

        if (shouldDelete) {
            this.deleteItem(this.activeElement);
        } else {
            // Snap back to original position
            this.activeElement.style.transform = 'translateX(0)';
        }

        this.resetState();
    }

    deleteItem(swipeContent) {
        const listItem = swipeContent.closest('.swipe-container');
        
        // Animate out
        swipeContent.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            if (this.options.onDelete) {
                this.options.onDelete(listItem);
            }
            
            // Remove the item with a smooth height transition
            listItem.style.height = listItem.offsetHeight + 'px';
            listItem.style.overflow = 'hidden';
            listItem.style.transition = 'height 0.3s ease';
            
            setTimeout(() => {
                listItem.style.height = '0px';
                listItem.style.padding = '0px';
                listItem.style.margin = '0px';
                listItem.style.borderWidth = '0px';
            }, 10);
            
            setTimeout(() => {
                listItem.remove();
            }, 300);
        }, this.options.animationDuration);
    }

    getClientX(e) {
        return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    }

    resetState() {
        this.isDragging = false;
        this.activeElement = null;
        this.startX = 0;
        this.currentX = 0;
    }

    addItem(content) {
        const li = document.createElement('li');
        li.className = 'swipe-container';
        li.innerHTML = `
            <div class="swipe-delete">Delete</div>
            ${content}
        `;
        this.list.appendChild(li);
    }

    destroy() {
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);
        document.removeEventListener('touchend', this.handleEnd);
    }
}