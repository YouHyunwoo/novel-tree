const spinner = document.getElementById('loading-spinner');

export function showLoadingSpinner() {
    spinner.classList.remove('hidden');
}

export function hideLoadingSpinner() {
    spinner.classList.add('hidden');
}