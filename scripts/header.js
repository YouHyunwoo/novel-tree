// 헤더 관련 스크립트
export function createHeader() {
    const header = document.createElement('header');
    header.className = 'novel-header';
    header.innerHTML = '<a href="index.html" class="novel-logo-link"><span>Novel Tree</span></a> <button class="menu-btn">☰</button>';
    document.body.prepend(header);
    return header;
}

let lastScroll = 0;
export function handleHeader() {
    const header = document.querySelector('header.novel-header');
    const curr = window.scrollY;
    if (curr > lastScroll && curr > 50) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    lastScroll = curr;
}
