/**
 * 에디터 UI 렌더링 및 DOM 갱신 담당 클래스
 */
export class EditorViewRenderer {
    constructor(editorState, nodeManager, statusManager) {
        this.editorState = editorState;
        this.nodeManager = nodeManager;
        this.statusManager = statusManager;
    }
    /**
     * 전체 에디터 UI 렌더링
     */
    renderAll() {
        this.renderNodes();
        this.renderStatusPanel();
        // ...필요시 기타 UI 렌더링...
    }
    /**
     * 노드 캔버스 렌더링
     */
    renderNodes() {
        const nodeCanvas = document.getElementById('node-canvas');
        if (!nodeCanvas) return;
        nodeCanvas.innerHTML = '';
        const nodes = this.nodeManager.getAllNodes();
        const activeId = this.editorState.getSelectedNodeId();
        // 노드 div 생성 및 추가
        const nodeDivMap = {};
        nodes.forEach(node => {
            const div = this.createNodeElement(node, activeId);
            nodeCanvas.appendChild(div);
            nodeDivMap[node.id] = div;
        });
        // 기존 SVG 연결선 제거
        const oldSvg = nodeCanvas.querySelector('svg.node-link');
        if (oldSvg) oldSvg.remove();
        // SVG 연결선 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('node-link');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        // 각 본문 노드의 next 연결선 그리기
        nodes.forEach(node => {
            if (node.type === 'text' && node.next) {
                const fromDiv = nodeDivMap[node.id];
                const toDiv = nodeDivMap[node.next];
                if (!fromDiv || !toDiv) return;
                // from: 핸들 오른쪽 중앙
                const fromRect = fromDiv.getBoundingClientRect();
                const handle = fromDiv.querySelector('.next-link-handle');
                const handleRect = handle ? handle.getBoundingClientRect() : fromRect;
                // to: 다음 노드 왼쪽 중앙
                const toRect = toDiv.getBoundingClientRect();
                // nodeCanvas 기준 좌표로 변환
                const canvasRect = nodeCanvas.getBoundingClientRect();
                const startX = handleRect.right - canvasRect.left;
                const startY = (handleRect.top + handleRect.bottom) / 2 - canvasRect.top;
                const endX = toRect.left - canvasRect.left;
                const endY = (toRect.top + toRect.bottom) / 2 - canvasRect.top;
                // SVG path 생성 (좌→우 곡선)
                const deltaX = Math.max(40, Math.abs(endX - startX) / 2);
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d',
                    `M${startX},${startY} C${startX + deltaX},${startY} ${endX - deltaX},${endY} ${endX},${endY}`
                );
                path.setAttribute('stroke', '#3949ab');
                path.setAttribute('stroke-width', '3');
                path.setAttribute('fill', 'none');
                path.setAttribute('opacity', '0.85');
                svg.appendChild(path);
            }
            // 선택지 노드의 각 선택지 next 연결선 그리기
            if (node.type === 'choice' && Array.isArray(node.choices)) {
                const fromDiv = nodeDivMap[node.id];
                if (!fromDiv) return;
                node.choices.forEach((choice, idx) => {
                    if (!choice.next) return;
                    const toDiv = nodeDivMap[choice.next];
                    if (!toDiv) return;
                    // from: 해당 choice-row의 핸들 오른쪽 중앙
                    const choiceRows = fromDiv.querySelectorAll('.choice-row');
                    const row = choiceRows[idx];
                    if (!row) return;
                    const handle = row.querySelector('.next-link-handle');
                    const handleRect = handle ? handle.getBoundingClientRect() : row.getBoundingClientRect();
                    const canvasRect = nodeCanvas.getBoundingClientRect();
                    const startX = handleRect.right - canvasRect.left;
                    const startY = (handleRect.top + handleRect.bottom) / 2 - canvasRect.top;
                    // to: 다음 노드 왼쪽 중앙
                    const toRect = toDiv.getBoundingClientRect();
                    const endX = toRect.left - canvasRect.left;
                    const endY = (toRect.top + toRect.bottom) / 2 - canvasRect.top;
                    const deltaX = Math.max(40, Math.abs(endX - startX) / 2);
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d',
                        `M${startX},${startY} C${startX + deltaX},${startY} ${endX - deltaX},${endY} ${endX},${endY}`
                    );
                    path.setAttribute('stroke', '#3949ab');
                    path.setAttribute('stroke-width', '3');
                    path.setAttribute('fill', 'none');
                    path.setAttribute('opacity', '0.85');
                    svg.appendChild(path);
                });
            }
        });
        nodeCanvas.appendChild(svg);
    }

    /**
     * 노드 객체로부터 노드 DOM 엘리먼트 생성
     * @param {object} node - 노드 데이터 객체
     * @param {string|null} activeId - 활성 노드 id
     * @returns {HTMLDivElement}
     */
    createNodeElement(node, activeId) {
        const div = document.createElement('div');
        div.className = 'story-node' + (node.id === activeId ? ' selected' : '');
        div.setAttribute('data-id', node.id);
        div.style.left = (node.x || 0) + 'px';
        div.style.top = (node.y || 0) + 'px';

        // 이름
        const nameSpan = document.createElement('span');
        nameSpan.className = 'node-name';
        nameSpan.textContent = node.name || node.id;
        div.appendChild(nameSpan);

        // 유형
        const typeSpan = document.createElement('span');
        typeSpan.className = 'node-type';
        typeSpan.textContent = ` [${this.getNodeTypeLabel(node.type)}]`;
        div.appendChild(typeSpan);

        // 유형별 하위 UI 분기
        if (node.type === 'text') {
            // 본문 내용 표시 및 접기/펼치기
            if (node.content && node.content.trim().length > 0) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'node-content-body node-content-preview collapsed';
                contentDiv.textContent = node.content;
                contentDiv.title = '클릭하여 펼치기/접기';
                contentDiv.style.cursor = 'pointer';
                contentDiv.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (contentDiv.classList.contains('collapsed')) {
                        contentDiv.classList.remove('collapsed');
                        contentDiv.classList.remove('node-content-preview');
                        contentDiv.classList.add('node-content-full');
                    } else {
                        contentDiv.classList.add('collapsed');
                        contentDiv.classList.remove('node-content-full');
                        contentDiv.classList.add('node-content-preview');
                    }
                });
                div.appendChild(contentDiv);
            }
            // 다음 노드 정보와 핸들을 한 행에 배치
            const nextRow = document.createElement('div');
            nextRow.className = 'node-next-row';
            nextRow.style.display = 'flex';
            nextRow.style.alignItems = 'center';
            const nextSpan = document.createElement('span');
            nextSpan.className = 'node-next';
            let nextText = '';
            if (node.next) {
                const nextNode = this.nodeManager.getNodeById(node.next);
                const nextName = nextNode ? nextNode.name || nextNode.id : node.next;
                const maxLen = 12;
                const shown = nextName.length > maxLen ? nextName.slice(0, maxLen) + '...' : nextName;
                nextText = ` → 다음: ${shown}`;
                nextSpan.title = nextName;
            } else {
                nextText = ' → 다음: 없음';
            }
            nextSpan.textContent = nextText;
            nextRow.appendChild(nextSpan);
            const handle = document.createElement('div');
            handle.className = 'next-link-handle';
            handle.title = '다음 노드 연결';
            nextRow.appendChild(handle);
            div.appendChild(nextRow);
        } else if (node.type === 'choice') {
            // 선택지 목록 표시
            const choicesWrap = document.createElement('div');
            choicesWrap.className = 'choices-wrap';
            choicesWrap.style.display = 'flex';
            choicesWrap.style.flexDirection = 'column';
            choicesWrap.style.gap = '6px';
            if (Array.isArray(node.choices)) {
                node.choices.forEach((choice, idx) => {
                    const row = document.createElement('div');
                    row.className = 'choice-row';
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    // 선택지 텍스트(레이블)
                    const textSpan = document.createElement('span');
                    textSpan.className = 'choice-text';
                    textSpan.textContent = choice.text || `선택지 ${idx + 1}`;
                    row.appendChild(textSpan);
                    // 핸들(다음 노드 연결)
                    const handle = document.createElement('div');
                    handle.className = 'next-link-handle';
                    handle.title = '이 선택지에 연결';
                    handle.setAttribute('data-choice-idx', idx); // 선택지 인덱스 부여
                    handle.setAttribute('data-node-id', node.id); // 노드 id 부여
                    row.appendChild(handle);
                    choicesWrap.appendChild(row);
                });
            }
            div.appendChild(choicesWrap);
        }
        // ...기타 유형은 추후 구현...
        return div;
    }

    // 노드 유형 한글 라벨 반환
    getNodeTypeLabel(type) {
        switch (type) {
            case 'text':
                return '본문';
            case 'choice':
                return '선택지';
            case 'condition':
                return '조건분기';
            default:
                return type;
        }
    }
    /**
     * 상태 관리 패널 렌더링
     */
    renderStatusPanel() {
        let panel = document.getElementById('status-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'status-panel';
            panel.className = 'status-panel';
            // 항상 body에 floating으로 추가
            document.body.appendChild(panel);
        }
        panel.innerHTML = '';
        const title = document.createElement('div');
        title.className = 'status-panel-title';
        title.textContent = '상태 관리 패널';
        panel.appendChild(title);
        const list = document.createElement('ul');
        list.className = 'status-list';
        this.statusManager.getAllStatus().forEach(status => {
            const li = document.createElement('li');
            li.className = 'status-item';
            // 이름(클릭시 편집), 유형, 초기값, 삭제 버튼
            const nameBtn = document.createElement('button');
            nameBtn.className = 'status-name-btn';
            nameBtn.textContent = status.name;
            // TODO: 클릭시 상태 편집 다이얼로그 호출
            li.appendChild(nameBtn);
            const typeSpan = document.createElement('span');
            typeSpan.className = 'status-type';
            typeSpan.textContent = `(${status.type === 'number' ? '실수' : '참거짓'})`;
            li.appendChild(typeSpan);
            const initialInput = document.createElement('input');
            initialInput.className = 'status-initial-input';
            initialInput.type = 'text';
            initialInput.value = status.initial;
            initialInput.disabled = true; // 직접 편집은 다이얼로그에서만
            li.appendChild(initialInput);
            const delBtn = document.createElement('button');
            delBtn.className = 'status-del-btn';
            delBtn.textContent = '삭제';
            // TODO: 클릭시 삭제 동작 연결
            li.appendChild(delBtn);
            list.appendChild(li);
        });
        panel.appendChild(list);
        // 추가 버튼
        const addBtn = document.createElement('button');
        addBtn.className = 'status-add-btn';
        addBtn.textContent = '추가';
        // TODO: 클릭시 상태 추가 다이얼로그 호출
        panel.appendChild(addBtn);
    }
}
