import { updateProgressBar } from './progress-bar.js';

// novel-story.js
// 소설 내용(스토리) 관련 스크립트 분리

const novel = document.getElementById('novel');

let choiceStates = {};
let sceneMap = null;
let renderedSceneIds = [];
let story;
let triggeredSceneEvents = new Set();
let currentActiveSceneId = null;

export function showStory() {
    novel.style.visibility = 'visible';
}

export function hideStory() {
    novel.style.visibility = 'hidden';
}

export function renderTitleAndAct() {
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
    if (story && Array.isArray(story.nodes)) {
        story.nodes.forEach(node => {
            sceneMap[node.id] = node;
        });
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTextBlock(block, novel) {
    const p = document.createElement('p');
    p.className = 'novel-text fade-in';
    // content의 \n을 <br>로 변환, XSS 방지용 escape 처리
    if (block.content) {
        p.innerHTML = escapeHtml(block.content).replace(/\n/g, '<br>');
    }
    if (block.id) p.setAttribute('data-scene-id', block.id);
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
    question.textContent = block.content;
    box.appendChild(question);
    block.choices.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.textContent = opt.text;
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
                onChoice(opt.next, box, idx, opt.text);
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
    if (!story || !Array.isArray(story.nodes)) return;
    // renderedSceneIds가 비어있지 않으면, 기존 내용은 유지하고 이어서 렌더링
    if (!Array.isArray(renderedSceneIds)) {
        renderedSceneIds = [];
    }
    
    // startId가 없고, renderedSceneIds가 비어있으면 첫 블럭 id로 시작
    let firstId = (story.nodes && story.nodes.length > 0 && story.nodes[0].id) ? story.nodes[0].id : null;
    let currentId = startId || (renderedSceneIds.length === 0 ? firstId : renderedSceneIds[renderedSceneIds.length - 1]);
    if (!currentId) return;
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
            if (Array.isArray(block.options) && block.options[choiceStates[block.id]]) {
                currentId = block.options[choiceStates[block.id]].next;
            } else {
                break;
            }
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
    if (story && Array.isArray(story.events) && story.events.some(e => e.type === 'sound')) {
        setTimeout(() => {
            showSoundActivationOverlay();
        }, 100);
    }
}

export function handleSceneTriggerEvents() {
    if (!sceneMap) return;
    const centerY = window.scrollY + window.innerHeight / 2;
    let newActiveSceneId = null;
    for (const sceneId of Object.keys(sceneMap)) {
        const block = sceneMap[sceneId];
        const el = document.querySelector(`[data-scene-id='${sceneId}']`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const elTop = rect.top + window.scrollY;
        let elBottom = rect.bottom + window.scrollY;
        let marginBottom = 0;
        if (el.classList.contains('novel-text')) {
            const style = window.getComputedStyle(el);
            marginBottom = parseFloat(style.marginBottom) || 0;
        }
        elBottom += marginBottom;
        let next = el.nextElementSibling;
        if (next && next.tagName === 'DIV' && !next.hasAttribute('data-scene-id')) {
            const nextRect = next.getBoundingClientRect();
            elBottom += nextRect.height;
        }
        let bar = el.querySelector('.trigger-bar');
        if (!bar && el.classList.contains('novel-text')) {
            bar = document.createElement('div');
            bar.className = 'trigger-bar hide';
            el.insertBefore(bar, el.firstChild);
        }
        if (centerY >= elTop && centerY < elBottom) {
            newActiveSceneId = sceneId;
            if (bar) bar.classList.remove('hide');
        } else {
            if (bar) bar.classList.add('hide');
        }
    }
    if (newActiveSceneId && newActiveSceneId !== currentActiveSceneId) {
        const block = sceneMap[newActiveSceneId];
        if (block && block.triggerEvents) {
            block.triggerEvents.forEach(event => {
                if (event.type === 'background') {
                    applySceneBackground(event);
                } else if (event.type === 'sound') {
                    if (!triggeredSceneEvents.has(newActiveSceneId + '-sound')) {
                        playSceneSound(event);
                        triggeredSceneEvents.add(newActiveSceneId + '-sound');
                    }
                }
            });
        }
    }
    currentActiveSceneId = newActiveSceneId;
}

export function applySceneBackground(event) {
    const bgA = document.getElementById('bg-normal');
    const bgB = document.getElementById('bg-normal-buffer');
    if (!bgA || !bgB) return;
    // 현재 어떤 div가 보이는지 추적
    if (!applySceneBackground.current) {
        applySceneBackground.current = 'A';
    }
    const showA = applySceneBackground.current === 'A';
    const showDiv = showA ? bgA : bgB;
    const hideDiv = showA ? bgB : bgA;
    // 빈 url이면 모두 숨김
    if (!event.bg || event.bg.trim() === '') {
        bgA.style.opacity = 0;
        bgB.style.opacity = 0;
        bgA.classList.remove('active');
        bgB.classList.remove('active');
        setTimeout(() => {
            bgA.style.backgroundImage = 'none';
            bgB.style.backgroundImage = 'none';
        }, 400);
        return;
    }
    // 다음 배경을 미리 세팅
    hideDiv.style.backgroundImage = `url('${event.bg}')`;
    hideDiv.classList.add('active');
    hideDiv.style.opacity = 1;
    // 기존 보이던 배경은 투명하게
    showDiv.style.opacity = 0;
    showDiv.classList.remove('active');
    // 0.4초 후 z-index 교체 및 상태 전환
    setTimeout(() => {
        showDiv.style.backgroundImage = 'none';
        applySceneBackground.current = showA ? 'B' : 'A';
    }, 400);
}

export function playSceneSound(event) {
    const audio = document.getElementById('event-audio');
    if (audio && event.sound) {
        audio.src = event.sound;
        audio.currentTime = 0;
        audio.play().catch(()=>{});
    }
}

function showSoundActivationOverlay() {
    const overlay = document.getElementById('sound-activation-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.classList.remove('hide');
    const recommendMode = getRecommendModeFromUrl();
    let modeMsg = '';
    if (recommendMode === 'dark') {
        modeMsg = '<div class="recommend-mode-msg">이 작품은 <b>다크 모드</b>를 추천합니다.</div>';
    } else if (recommendMode === 'light') {
        modeMsg = '<div class="recommend-mode-msg">이 작품은 <b>라이트 모드</b>를 추천합니다.</div>';
    }
    const baseMsg = '<div>사운드가 재생될 수 있는 작품입니다.</div>';
    overlay.innerHTML = baseMsg + modeMsg;
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

function getRecommendModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('recommendMode') || null;
}
