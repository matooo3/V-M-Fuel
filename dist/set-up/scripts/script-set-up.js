// main.js
// ==============================
// ===== MAIN ENTRY POINT =====
// ==============================

import { AppInitializer } from './appInitializer.js';

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.init();
});