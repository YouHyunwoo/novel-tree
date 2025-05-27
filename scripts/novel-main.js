// 소설 내용(스토리) 관련 스크립트
let choiceStates = {};
let sceneMap = null;
let renderedSceneIds = [];
let story;

function renderTitleAndAct() {
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

function renderNewlineBlock(novel) {
    const br = document.createElement('br');
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

function renderStory(startId = null) {
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
            renderNewlineBlock(novel);
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

function scrollToChoice(box) {
    setTimeout(() => {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

async function loadStory() {
    const res = await fetch('novels/half-blood-flame/story.json');
    story = await res.json();
    sceneMap = null;
    renderedSceneIds = [];
    choiceStates = {};
    renderStory();
}
