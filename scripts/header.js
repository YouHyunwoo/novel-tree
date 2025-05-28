// 헤더 관련 스크립트
function createHeader() {
    const header = document.createElement('header');
    header.className = 'novel-header';
    header.innerHTML = '<span>인터랙티브 소설</span> <button class="menu-btn">☰</button>';
    document.body.prepend(header);
    return header;
}

let lastScroll = 0;
function handleHeader() {
    const header = document.querySelector('header.novel-header');
    const curr = window.scrollY;
    if (curr > lastScroll && curr > 50) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    lastScroll = curr;
}
