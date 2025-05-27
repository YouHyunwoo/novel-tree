// 헤더 생성
function createHeader() {
    const header = document.createElement('header');
    header.className = 'novel-header';
    header.innerHTML = '<span>인터랙티브 소설</span> <button class="menu-btn">☰</button>';
    document.body.prepend(header);
    return header;
}

// 진행도 바 생성
function createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    document.body.appendChild(bar);
    return bar;
}

// 선택지 상태 저장
let choiceStates = {};

let progressBarCurrent = 0;
let progressBarTarget = 0;
let progressBarAnimating = false;

function animateProgressBar() {
    if (!progressBarAnimating) return;
    const bar = document.querySelector('.progress-bar');
    const diff = progressBarTarget - progressBarCurrent;
    if (Math.abs(diff) < 0.5) {
        progressBarCurrent = progressBarTarget;
        bar.style.width = progressBarCurrent + '%';
        progressBarAnimating = false;
        return;
    }
    progressBarCurrent += diff * 0.15;
    bar.style.width = progressBarCurrent + '%';
    requestAnimationFrame(animateProgressBar);
}

// 진행도 바 업데이트
function updateProgressBar() {
    const bar = document.querySelector('.progress-bar');
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    let percent = 0;
    if (docHeight <= 0) {
        percent = 100;
    } else {
        percent = (scrollTop / docHeight) * 100;
    }
    progressBarTarget = percent;
    if (!progressBarAnimating) {
        progressBarAnimating = true;
        requestAnimationFrame(animateProgressBar);
    }
}

// 스토리 렌더링
function renderStory() {
    const novel = document.getElementById('novel');
    let stopAtChoice = false;
    let renderedCount = novel.childElementCount;
    for (let i = renderedCount; i < story.length; i++) {
        const block = story[i];
        if (typeof block === 'string') {
            if (!stopAtChoice && block.trim() !== '') {
                const p = document.createElement('p');
                p.className = 'novel-text fade-in';
                p.textContent = block;
                novel.appendChild(p);
                setTimeout(() => p.classList.add('visible'), 30);
                updateProgressBar();
            }
        } else if (block.type === 'newline') {
            if (!stopAtChoice) {
                const br = document.createElement('br');
                novel.appendChild(br);
                updateProgressBar();
            }
        } else if (block.type === 'choice') {
            const box = document.createElement('div');
            box.className = 'choice-box fade-in';
            const question = document.createElement('p');
            question.textContent = block.question;
            box.appendChild(question);
            block.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'choice-button';
                btn.textContent = opt.label;
                if (choiceStates[i] !== undefined) {
                    if (choiceStates[i] === idx) {
                        btn.classList.add('selected');
                        btn.innerHTML += ' ✔';
                    } else {
                        btn.classList.add('disabled');
                        btn.disabled = true;
                    }
                }
                btn.onclick = () => {
                    if (choiceStates[i] === undefined) {
                        choiceStates[i] = idx;
                        renderStory();
                        scrollToChoice(box);
                    }
                };
                box.appendChild(btn);
            });
            novel.appendChild(box);
            setTimeout(() => box.classList.add('visible'), 30);
            updateProgressBar();
            if (choiceStates[i] === undefined) {
                stopAtChoice = true;
                break;
            }
        }
        if (stopAtChoice) break;
    }
    updateProgressBar();
}

function scrollToChoice(box) {
    setTimeout(() => {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// 헤더 show/hide
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

function initializeApp() {
    // 헤더/진행도 바 생성
    createHeader();
    createProgressBar();
    renderStory();
    updateProgressBar();

    window.addEventListener('scroll', () => {
        handleHeader();
        updateProgressBar();
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
