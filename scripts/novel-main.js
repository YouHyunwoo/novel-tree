import { createHeader, handleHeader } from './header.js';
import { createProgressBar, updateProgressBar } from './progress-bar.js';
import { renderTitleAndAct, renderStory, scrollToChoice, loadStory, handleSceneTriggerEvents } from './novel-story.js';

function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'flex';
    document.getElementById('novel').style.visibility = 'hidden';
}
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
    document.getElementById('novel').style.visibility = 'visible';
}

async function initializeApp() {
    showLoadingSpinner();
    createHeader();
    createProgressBar();
    await loadStory();
    hideLoadingSpinner();
    updateProgressBar();
    window.addEventListener('scroll', () => {
        handleHeader();
        updateProgressBar();
        handleSceneTriggerEvents();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    // addCenterRedBarForTest();
});

function addCenterRedBarForTest() {
    const bar = document.createElement('div');
    bar.className = 'center-red-bar';
    document.body.appendChild(bar);
}