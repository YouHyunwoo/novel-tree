// 다크 모드 토글 스크립트
function setDarkMode(enabled) {
    const darkLink = document.getElementById('dark-css');
    const lightLink = document.getElementById('light-css');
    if (enabled) {
        darkLink.disabled = false;
        lightLink.disabled = true;
        localStorage.setItem('darkMode', 'on');
    } else {
        darkLink.disabled = true;
        lightLink.disabled = false;
        localStorage.setItem('darkMode', 'off');
    }
}

function toggleDarkMode() {
    const darkLink = document.getElementById('dark-css');
    setDarkMode(darkLink.disabled);
}

window.addEventListener('DOMContentLoaded', () => {
    // 시스템 다크 모드 선호 시 진입 시점에 body 배경색을 어둡게, 아니면 밝게 설정
    if (!localStorage.getItem('darkMode')) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.style.backgroundColor = '#111';
        } else {
            document.body.style.backgroundColor = '#f9f9fb';
        }
    }
    const darkLink = document.getElementById('dark-css');
    const saved = localStorage.getItem('darkMode');
    if (saved === 'on') {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
    // 오른쪽 하단 고정 다크 모드 SVG 아이콘 버튼 생성
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', '다크 모드 토글');
    btn.id = 'dark-mode-fab';
    btn.style.position = 'fixed';
    btn.style.right = '24px';
    btn.style.bottom = '24px';
    btn.style.width = '56px';
    btn.style.height = '56px';
    btn.style.borderRadius = '50%';
    btn.style.background = '#5c6bc0';
    btn.style.color = '#fff';
    btn.style.fontSize = '2rem';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = 2000;
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.transition = 'background 0.2s';
    // SVG 아이콘 컨테이너
    const iconWrap = document.createElement('span');
    iconWrap.style.display = 'inline-block';
    iconWrap.style.width = '32px';
    iconWrap.style.height = '32px';
    iconWrap.style.position = 'relative';
    iconWrap.style.transition = 'opacity 0.3s';
    // SVG 코드
    const sunSVG = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" fill="#FFD600"/><g stroke="#FFD600" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g></svg>`;
    const moonSVG = `<svg viewBox='0 0 24 24' width='32' height='32' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M18 12c0 3.313-2.687 6-6 6-1.657 0-3.14-0.672-4.243-1.757C10.5 16 15 11.5 13.757 6.243A6.002 6.002 0 0 1 18 12z' fill='#FFD600'/></svg>`;
    iconWrap.innerHTML = darkLink.disabled ? moonSVG : sunSVG;
    btn.appendChild(iconWrap);
    btn.onclick = () => {
        iconWrap.style.opacity = 0;
        setTimeout(() => {
            toggleDarkMode();
            iconWrap.innerHTML = darkLink.disabled ? moonSVG : sunSVG;
            iconWrap.style.opacity = 1;
        }, 200);
    };
    document.body.appendChild(btn);
});
