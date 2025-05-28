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