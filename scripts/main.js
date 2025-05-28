import { createHeader, handleHeader } from './header.js';
import { createProgressBar, updateProgressBar } from './progress-bar.js';
import { loadStory } from './novel-main.js';

function initializeApp() {
    createHeader();
    createProgressBar();
    loadStory();
    updateProgressBar();
    window.addEventListener('scroll', () => {
        handleHeader();
        updateProgressBar();
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);