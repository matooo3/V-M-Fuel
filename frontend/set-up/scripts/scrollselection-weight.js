class AppleWeightPicker {
            constructor() {
                this.currentUnit = 'kg';
                this.selectedWhole = 75;
                this.selectedDecimal = 5;
                
                this.unitToggle = document.getElementById('unitToggle');
                this.wholePicker = document.getElementById('wholePicker');
                this.decimalPicker = document.getElementById('decimalPicker');
                this.selectedWeightEl = document.getElementById('selectedWeight');
                
                this.init();
            }
            
            init() {
                this.populateWhole();
                this.populateDecimal();
                this.setupEventListeners();
                this.updateSelectedWeight();
                this.scrollToSelected();
            }
            
            populateWhole() {
                // Clear existing items
                this.wholePicker.innerHTML = '';
                
                const range = this.getWeightRange();
                for (let i = range.min; i <= range.max; i++) {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.textContent = i;
                    item.dataset.value = i;
                    this.wholePicker.appendChild(item);
                }
            }
            
            populateDecimal() {
                this.decimalPicker.innerHTML = '';
                
                for (let i = 0; i <= 9; i++) {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.textContent = i;
                    item.dataset.value = i;
                    this.decimalPicker.appendChild(item);
                }
            }
            
            getWeightRange() {
                if (this.currentUnit === 'kg') {
                    return { min: 30, max: 200 }; // 30kg to 200kg
                } else {
                    return { min: 66, max: 440 }; // 66lbs to 440lbs (roughly 30kg to 200kg)
                }
            }
            
            setupEventListeners() {
                // Unit toggle
                this.unitToggle.addEventListener('click', (e) => {
                    if (e.target.classList.contains('unit-button')) {
                        this.switchUnit(e.target.dataset.unit);
                    }
                });
                
                // Picker scrolling
                this.wholePicker.addEventListener('scroll', () => this.handleScroll('whole'));
                this.decimalPicker.addEventListener('scroll', () => this.handleScroll('decimal'));
                
                // Click to select
                this.wholePicker.addEventListener('click', (e) => this.handleClick(e, 'whole'));
                this.decimalPicker.addEventListener('click', (e) => this.handleClick(e, 'decimal'));
                
                // Mouse wheel handling
                this.wholePicker.addEventListener('wheel', (e) => this.handleWheel(e, 'whole'));
                this.decimalPicker.addEventListener('wheel', (e) => this.handleWheel(e, 'decimal'));
            }
            
            switchUnit(newUnit) {
                if (newUnit === this.currentUnit) return;
                
                // Convert current weight
                const currentWeight = this.selectedWhole + (this.selectedDecimal / 10);
                let convertedWeight;
                
                if (newUnit === 'pounds') {
                    // kg to pounds
                    convertedWeight = currentWeight * 2.20462;
                    this.unitToggle.classList.add('pounds');
                } else {
                    // pounds to kg
                    convertedWeight = currentWeight / 2.20462;
                    this.unitToggle.classList.remove('pounds');
                }
                
                this.currentUnit = newUnit;
                this.selectedWhole = Math.floor(convertedWeight);
                this.selectedDecimal = Math.round((convertedWeight % 1) * 10);
                
                // Update active button
                document.querySelectorAll('.unit-button').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.unit === newUnit);
                });
                
                // Repopulate and scroll to new values
                this.populateWhole();
                this.updateSelectedWeight();
                this.scrollToSelected();
            }
            
            handleWheel(e, type) {
                e.preventDefault();
                
                const picker = type === 'whole' ? this.wholePicker : this.decimalPicker;
                const itemHeight = 40;
                const direction = e.deltaY > 0 ? 1 : -1;
                
                const currentScroll = picker.scrollTop;
                const targetScroll = currentScroll + (direction * itemHeight);
                
                picker.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
            
            handleScroll(type) {
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.updateSelection(type);
                }, 150);
                
                this.updateItemStyles(type);
            }
            
            handleClick(e, type) {
                if (e.target.classList.contains('picker-item')) {
                    const value = parseInt(e.target.dataset.value);
                    this.setSelection(type, value);
                    this.scrollToValue(type, value);
                }
            }
            
            updateSelection(type) {
                const picker = type === 'whole' ? this.wholePicker : this.decimalPicker;
                const items = picker.querySelectorAll('.picker-item');
                const centerY = picker.scrollTop + picker.clientHeight / 2;
                
                let closestItem = null;
                let closestDistance = Infinity;
                
                items.forEach(item => {
                    const itemY = item.offsetTop + item.offsetHeight / 2;
                    const distance = Math.abs(centerY - itemY);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestItem = item;
                    }
                });
                
                if (closestItem) {
                    const value = parseInt(closestItem.dataset.value);
                    this.setSelection(type, value);
                }
            }
            
            setSelection(type, value) {
                if (type === 'whole') {
                    this.selectedWhole = value;
                } else if (type === 'decimal') {
                    this.selectedDecimal = value;
                }
                
                this.updateSelectedWeight();
            }
            
            updateItemStyles(type) {
                const picker = type === 'whole' ? this.wholePicker : this.decimalPicker;
                const items = picker.querySelectorAll('.picker-item');
                const centerY = picker.scrollTop + picker.clientHeight / 2;
                
                items.forEach(item => {
                    const itemY = item.offsetTop + item.offsetHeight / 2;
                    const distance = Math.abs(centerY - itemY);
                    
                    if (distance < 20) {
                        item.style.color = '#1d1d1f';
                        item.style.fontWeight = '600';
                    } else if (distance < 40) {
                        item.style.color = '#8e8e93';
                        item.style.fontWeight = '400';
                    } else if (distance < 80) {
                        item.style.color = '#c7c7cc';
                        item.style.fontWeight = '400';
                    } else {
                        item.style.color = '#e5e5ea';
                        item.style.fontWeight = '400';
                    }
                });
            }
            
            scrollToValue(type, value) {
                const picker = type === 'whole' ? this.wholePicker : this.decimalPicker;
                const targetItem = picker.querySelector(`[data-value="${value}"]`);
                
                if (targetItem) {
                    const targetY = targetItem.offsetTop - picker.clientHeight / 2 + targetItem.offsetHeight / 2;
                    picker.scrollTo({
                        top: targetY,
                        behavior: 'smooth'
                    });
                }
            }
            
            scrollToSelected() {
                setTimeout(() => {
                    this.scrollToValue('whole', this.selectedWhole);
                    this.scrollToValue('decimal', this.selectedDecimal);
                }, 100);
            }
            
            updateSelectedWeight() {
                const weight = this.selectedWhole + (this.selectedDecimal / 10);
                this.selectedWeightEl.textContent = `${weight.toFixed(1)} ${this.currentUnit}`;
            }
        }
        
        // Initialize the weight picker when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new AppleWeightPicker();
        });