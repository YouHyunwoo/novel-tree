import { createHeader, handleHeader } from './header.js';
import { createProgressBar, updateProgressBar } from './progress-bar.js';

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
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);


// 소설 내용(스토리) 관련 스크립트
let choiceStates = {};
let sceneMap = null;
let renderedSceneIds = [];
let story;

export function renderTitleAndAct() {
    const novel = document.getElementById('novel');
    if (document.querySelector('.novel-title')) return;
    if (story && story.title) {
        const title = document.createElement('h1');
        title.className = 'novel-title fade-in';
        title.textContent = story.title;
        novel.appendChild(title);
        setTimeout(() => title.classList.add('visible'), 30);
    }
    if (story && story.act) {
        const act = document.createElement('h2');
        act.className = 'novel-act fade-in';
        act.textContent = story.act;
        novel.appendChild(act);
        setTimeout(() => act.classList.add('visible'), 30);
    }
}

function buildSceneMap() {
    sceneMap = {};
    story.scenes.forEach(scene => {
        sceneMap[scene.id] = scene;
    });
}

function renderTextBlock(block, novel) {
    const p = document.createElement('p');
    p.className = 'novel-text fade-in';
    p.textContent = block.content;
    novel.appendChild(p);
    setTimeout(() => p.classList.add('visible'), 30);
    updateProgressBar();
}

function renderNewlineBlock(block, novel) {
    const br = document.createElement('div');
    br.style.height = (block && block.space ? block.space : 24) + 'px';
    novel.appendChild(br);
    updateProgressBar();
}

function renderChoiceBlock(block, novel, onChoice) {
    const box = document.createElement('div');
    box.className = 'choice-box fade-in';
    const question = document.createElement('p');
    question.textContent = block.question;
    box.appendChild(question);
    block.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.textContent = opt.label;
        if (choiceStates[block.id] !== undefined) {
            if (choiceStates[block.id] === idx) {
                btn.classList.add('selected');
                btn.innerHTML += ' ✔';
                btn.disabled = true;
            } else {
                btn.classList.add('disabled');
                btn.disabled = true;
            }
        }
        btn.onclick = () => {
            if (choiceStates[block.id] === undefined) {
                choiceStates[block.id] = idx;
                onChoice(opt.next, box, idx, opt.label);
            }
        };
        box.appendChild(btn);
    });
    novel.appendChild(box);
    setTimeout(() => box.classList.add('visible'), 30);
    updateProgressBar();
}

export function renderStory(startId = null) {
    const novel = document.getElementById('novel');
    renderTitleAndAct();
    if (!sceneMap) buildSceneMap();
    if (startId) {
        const idx = renderedSceneIds.indexOf(startId);
        if (idx !== -1) {
            let removeCount = renderedSceneIds.length - idx;
            for (let i = 0; i < removeCount; i++) {
                let last = novel.lastElementChild;
                while (last && (last.classList.contains('novel-title') || last.classList.contains('novel-act'))) {
                    last = last.previousElementSibling;
                }
                if (last) novel.removeChild(last);
            }
            renderedSceneIds = renderedSceneIds.slice(0, idx);
        }
    }
    let currentId = startId || (renderedSceneIds.length === 0 ? story.scenes[0].id : renderedSceneIds[renderedSceneIds.length - 1]);
    let count = 0;
    while (currentId && !renderedSceneIds.includes(currentId)) {
        const block = sceneMap[currentId];
        if (!block) break;
        renderedSceneIds.push(currentId);
        if (block.type === 'text') {
            renderTextBlock(block, novel);
            currentId = block.next;
        } else if (block.type === 'newline') {
            renderNewlineBlock(block, novel);
            currentId = block.next;
        } else if (block.type === 'choice') {
            renderChoiceBlock(block, novel, (nextId, box, idx, label) => {
                // 버튼 상태 갱신
                Array.from(box.querySelectorAll('button')).forEach((b, bIdx) => {
                    if (bIdx === idx) {
                        b.classList.add('selected');
                        b.innerHTML = label + ' ✔';
                        b.disabled = true;
                    } else {
                        b.classList.add('disabled');
                        b.disabled = true;
                    }
                });
                renderStory(nextId);
                scrollToChoice(box);
            });
            if (choiceStates[block.id] === undefined) break;
            currentId = block.options[choiceStates[block.id]].next;
        } else {
            break;
        }
        count++;
        if (count > 1000) break;
    }
    updateProgressBar();
}

export function scrollToChoice(box) {
    setTimeout(() => {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// URL에서 novel 파라미터 추출 함수 추가
function getNovelIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('novel') || 'half-blood-flame';
}

export async function loadStory() {
    const novelId = getNovelIdFromUrl();
    const res = await fetch(`novels/${novelId}/story.json`);
    story = await res.json();
    sceneMap = null;
    renderedSceneIds = [];
    choiceStates = {};
    renderStory();
}

// 소설 본문(novel.html) 전용 스크립트
// novel.html에서만 동작하도록 DOM 체크 및 예외 처리 추가

// === 스크롤 트리거 이벤트 (story.json 기반, once/temporary 분리) ===
let triggeredEvents = new Set();
let originalBg = null;
let lastOnceBg = null;

function handleScrollEvents() {
    if (!story || !story.events) return;
    const scrollY = window.scrollY;
    // temporary 이벤트(일시적 배경)는 #bg-temp에서 처리
    story.events.forEach(event => {
        if (event.type === 'background' && event.bgMode === 'temporary') {
            if (!triggeredEvents.has(event.trigger + '-temporary')) {
                if (scrollY >= event.trigger) {
                    triggeredEvents.add(event.trigger + '-temporary');
                    const tempBg = document.getElementById('bg-temp');
                    if (!tempBg) return;
                    tempBg.style.backgroundImage = `url('${event.bg}')`;
                    tempBg.classList.add('active');
                    setTimeout(() => {
                        tempBg.classList.remove('active');
                        setTimeout(() => {
                            tempBg.style.backgroundImage = 'none';
                        }, 400);
                    }, event.duration || 2000);
                }
            }
        } else if (event.type === 'sound') {
            if (!triggeredEvents.has(event.trigger + '-sound')) {
                if (scrollY >= event.trigger) {
                    triggeredEvents.add(event.trigger + '-sound');
                    const audio = document.getElementById('event-audio');
                    if (audio && event.sound) {
                        audio.src = event.sound;
                        audio.currentTime = 0;
                        audio.play().catch(()=>{});
                    }
                }
            }
        }
    });
    // once 유형 배경: 현재 구간에 맞는 배경 적용 (#bg-once)
    const onceEvents = story.events.filter(e => e.type === 'background' && e.bgMode === 'once');
    onceEvents.sort((a, b) => a.trigger - b.trigger);
    let appliedBg = null;
    for (let i = 0; i < onceEvents.length; i++) {
        if (scrollY >= onceEvents[i].trigger) {
            appliedBg = onceEvents[i].bg;
        } else {
            break;
        }
    }
    const onceBg = document.getElementById('bg-once');
    if (onceBg) {
        if (!originalBg) originalBg = '';
        if (appliedBg) {
            if (lastOnceBg !== appliedBg) {
                onceBg.style.backgroundImage = `url('${appliedBg}')`;
                onceBg.style.opacity = 1;
                lastOnceBg = appliedBg;
            }
        } else {
            if (lastOnceBg !== null) {
                onceBg.style.opacity = 0;
                lastOnceBg = null;
            }
        }
    }
}

window.addEventListener('scroll', handleScrollEvents);

function showSoundActivationOverlay() {
    const overlay = document.getElementById('sound-activation-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.classList.remove('hide');
    overlay.onclick = function activateAudio() {
        const audio = document.getElementById('event-audio');
        if (audio) {
            audio.src = '';
            audio.play().catch(()=>{});
        }
        overlay.classList.add('hide');
        setTimeout(() => {
            overlay.hidden = true;
            overlay.classList.remove('hide');
        }, 400);
        overlay.onclick = null;
    };
}

document.addEventListener('DOMContentLoaded', () => {
    showSoundActivationOverlay();
});