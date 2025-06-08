const header = document.querySelector('header.novel-header');

let lastScroll = 0;

export function handleHeader() {
    const currentScroll = window.scrollY;

    if (lastScroll < currentScroll && 50 < currentScroll) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
}
