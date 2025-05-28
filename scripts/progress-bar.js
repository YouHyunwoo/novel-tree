// 진행도 바 관련 스크립트
let progressBarCurrent = 0;
let progressBarTarget = 0;
let progressBarAnimating = false;

function createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    document.body.appendChild(bar);
    return bar;
}

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
