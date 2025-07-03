// Your CustomSelect class (same as before)
export class CustomSelect {
    constructor(element) {
        this.element = element;
        this.trigger = element.querySelector('.select-trigger');
        this.dropdown = element.querySelector('.select-dropdown');
        this.options = element.querySelectorAll('.select-option');
        this.selectedText = element.querySelector('.select-text');
        this.arrow = element.querySelector('.select-arrow');
        this.isOpen = false;
        this.selectedValue = null;

        this.init();
    }

    init() {
        console.log('Initializing custom select:', this.element); // DEBUG

        // Toggle dropdown on trigger click
        this.trigger.addEventListener('click', (e) => {
            console.log('Trigger clicked'); // DEBUG
            e.stopPropagation();
            this.toggle();
        });

        // Handle option selection
        this.options.forEach(option => {
            option.addEventListener('click', (e) => {
                console.log('Option clicked:', option.textContent); // DEBUG
                e.stopPropagation();
                this.selectOption(option);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });

        // Handle keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        this.initializeDefault();

        // Make the element focusable
        this.trigger.setAttribute('tabindex', '0');

        // Add touch event handling for better mobile experience
        this.options.forEach(option => {
            option.addEventListener('touchstart', (e) => {
                // Add active class for visual feedback
                option.classList.add('touching');
            });

            option.addEventListener('touchend', (e) => {
                // Remove active class
                option.classList.remove('touching');
            });
        });
    }

    initializeDefault() {
        // Check if there's already a selected option
        const alreadySelected = this.element.querySelector('.select-option.selected');
        if (alreadySelected) {
            this.selectedText.textContent = alreadySelected.textContent;
            this.selectedValue = alreadySelected.dataset.value;
            return;
        }

        // If no option is pre-selected, select the first one
        const firstOption = this.options[0];
        if (firstOption) {
            this.selectOption(firstOption);
        }
    }

    toggle() {
        console.log('Toggle called, isOpen:', this.isOpen); // DEBUG
        this.isOpen ? this.close() : this.open();
    }

    open() {
        console.log('Opening dropdown'); // DEBUG
        this.isOpen = true;
        this.trigger.classList.add('active');
        this.dropdown.classList.add('active');
        this.trigger.setAttribute('aria-expanded', 'true');
    }

    close() {
        console.log('Closing dropdown'); // DEBUG
        this.isOpen = false;
        this.trigger.classList.remove('active');
        this.dropdown.classList.remove('active');
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    selectOption(option) {
        // Remove previous selection
        this.options.forEach(opt => opt.classList.remove('selected'));

        // Add selection to clicked option
        option.classList.add('selected');

        // Update display text and value
        this.selectedText.textContent = option.textContent;
        this.selectedValue = option.dataset.value;

        // Close dropdown
        this.close();

        // Trigger custom event
        const event = new CustomEvent('change', {
            detail: {
                value: this.selectedValue,
                text: option.textContent
            }
        });
        this.element.dispatchEvent(event);
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                }
                break;
            case 'Escape':
                this.close();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateOptions(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateOptions(-1);
                break;
        }
    }

    navigateOptions(direction) {
        if (!this.isOpen) {
            this.open();
            return;
        }

        const currentIndex = Array.from(this.options).findIndex(opt =>
            opt.classList.contains('selected')
        );

        let newIndex = currentIndex + direction;

        if (newIndex < 0) newIndex = this.options.length - 1;
        if (newIndex >= this.options.length) newIndex = 0;

        this.selectOption(this.options[newIndex]);
    }

    // Method to get current selected value
    getValue() {
        return this.selectedValue;
    }

    // Method to set selected value programmatically
    setValue(value) {
        const option = Array.from(this.options).find(opt => opt.dataset.value === value);
        if (option) {
            this.selectOption(option);
        }
    }
}