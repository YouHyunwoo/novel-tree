import { showLoadingSpinner, hideLoadingSpinner } from './loading-spinner.js';
import { handleHeader } from './header.js';
import { createProgressBar, updateProgressBar } from './progress-bar.js';
import { renderTitleAndAct, renderStory, scrollToChoice, loadStory, handleSceneTriggerEvents } from './novel-story.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    // addCenterRedBarForTest();
});

async function initializeApp() {
    showLoadingSpinner();
    createProgressBar();
    await loadStory();
    updateProgressBar();
    window.addEventListener('scroll', () => {
        handleHeader();
        updateProgressBar();
        handleSceneTriggerEvents();
    });
    hideLoadingSpinner();
}


function addCenterRedBarForTest() {
    const bar = document.createElement('div');
    bar.className = 'center-red-bar';
    document.body.appendChild(bar);
}