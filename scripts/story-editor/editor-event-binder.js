/**
 * 에디터 내 이벤트 바인딩 및 위임 담당 클래스
 */
export class EditorEventBinder {
    constructor(editorState, nodeManager, statusManager, viewRenderer, nodeDialogManager, statusDialogManager) {
        this.editorState = editorState;
        this.nodeManager = nodeManager;
        this.statusManager = statusManager;
        this.viewRenderer = viewRenderer;
        this.nodeDialogManager = nodeDialogManager;
        this.statusDialogManager = statusDialogManager;
    }
    /**
     * 모든 주요 이벤트 바인딩
     */
    bindAll() {
        this.bindStatusPanelEvents();
        this.bindNodePanelEvents();
        this.bindMoveToStartBtn();
        this.bindShortcutAddNodeEvents();
        // ...필요시 기타 이벤트 바인딩...
    }
    /**
     * 상태 패널(추가/편집/삭제) 이벤트 바인딩
     */
    bindStatusPanelEvents() {
        document.body.addEventListener('click', (e) => {
            // 상태 추가 버튼
            if (e.target.classList.contains('status-add-btn')) {
                this.statusDialogManager.openDialog(null);
            }
            // 상태 이름(편집)
            if (e.target.classList.contains('status-name-btn')) {
                const name = e.target.textContent;
                this.statusDialogManager.openDialog(name);
            }
            // 상태 삭제
            if (e.target.classList.contains('status-del-btn')) {
                const li = e.target.closest('.status-item');
                if (!li) return;
                const nameBtn = li.querySelector('.status-name-btn');
                if (!nameBtn) return;
                const name = nameBtn.textContent;
                this.statusManager.removeStatus(name);
                this.viewRenderer.renderStatusPanel();
            }
        });
    }
    /**
     * 노드 패널(노드 클릭/더블클릭 등) 이벤트 바인딩
     */
    bindNodePanelEvents() {
        const nodeCanvas = document.getElementById('node-canvas');
        if (!nodeCanvas) return;
        let dragState = null;
        let handleDragState = null;
        // 노드 드래그 시작
        nodeCanvas.addEventListener('mousedown', (e) => {
            // 핸들에서 드래그 시작 금지
            if (e.target.classList.contains('next-link-handle')) return;
            const nodeDiv = e.target.closest('.story-node');
            if (!nodeDiv) return;
            const nodeId = nodeDiv.getAttribute('data-id');
            if (nodeId === 'start') return; // 시작 노드는 이동 금지
            // 좌클릭만 허용
            if (e.button !== 0) return;
            const node = this.nodeManager.getNodeById(nodeId);
            if (!node) return;
            dragState = {
                nodeId,
                startX: e.clientX,
                startY: e.clientY,
                origX: node.x || 0,
                origY: node.y || 0
            };
            document.body.style.cursor = 'grabbing';
            e.preventDefault();
        });
        // 노드 드래그 이동
        window.addEventListener('mousemove', (e) => {
            if (!dragState) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            const newX = dragState.origX + dx;
            const newY = dragState.origY + dy;
            this.nodeManager.moveNode(dragState.nodeId, newX, newY);
            this.viewRenderer.renderNodes();
        });
        // 노드 드래그 종료
        window.addEventListener('mouseup', (e) => {
            if (dragState) {
                dragState = null;
                document.body.style.cursor = '';
            }
        });
        // 노드 클릭 시 활성화 및 콘솔 출력
        nodeCanvas.addEventListener('click', (e) => {
            // 선택지 노드의 선택지 핸들 클릭 시 새 노드 생성 및 연결
            if (
                e.target.classList.contains('next-link-handle') &&
                e.target.hasAttribute('data-choice-idx') &&
                e.target.hasAttribute('data-node-id')
            ) {
                const nodeId = e.target.getAttribute('data-node-id');
                const choiceIdx = parseInt(e.target.getAttribute('data-choice-idx'), 10);
                const node = this.nodeManager.getNodeById(nodeId);
                if (!node || node.type !== 'choice' || !Array.isArray(node.choices) || !node.choices[choiceIdx]) return;
                // 이미 연결되어 있으면 무시(원한다면 덮어쓰기 가능)
                if (node.choices[choiceIdx].next) return;
                // 새 본문 노드 생성
                const newNodeId = this.nodeManager.generateNodeId();
                const newNode = {
                    id: newNodeId,
                    name: '',
                    type: 'text',
                    content: '',
                    x: (node.x || 0) + 300,
                    y: (node.y || 0) + 80 * (choiceIdx + 1),
                    next: ''
                };
                this.nodeManager.addNode(newNode);
                // 해당 선택지 next에 연결
                this.nodeManager.connectNode(nodeId, newNodeId, { choiceIdx });
                this.editorState.setActiveNode(newNodeId);
                this.viewRenderer.renderNodes();
                return;
            }
            // 다음 노드 핸들 클릭 시(본문 노드)
            if (e.target.classList.contains('next-link-handle')) {
                const nodeDiv = e.target.closest('.story-node');
                if (!nodeDiv) return;
                const nodeId = nodeDiv.getAttribute('data-id');
                // 이미 next가 연결되어 있으면 무시(원한다면 덮어쓰기 가능)
                const node = this.nodeManager.getNodeById(nodeId);
                if (node && node.type === 'text' && node.next) return;
                // 새 본문 노드 생성 및 연결
                const newNode = this.nodeManager.addNodeAfter(nodeId, '본문');
                if (newNode) {
                    this.editorState.setActiveNode(newNode.id);
                    this.viewRenderer.renderNodes();
                }
                return;
            }
            // 일반 노드 클릭 시 활성화
            const nodeDiv = e.target.closest('.story-node');
            if (!nodeDiv) return;
            const nodeId = nodeDiv.getAttribute('data-id');
            this.editorState.setActiveNode(nodeId);
            this.viewRenderer.renderNodes();
        });
        // 시트 클릭 시 활성화 해제
        const sheetWrapper = document.getElementById('sheet-wrapper');
        if (sheetWrapper) {
            sheetWrapper.addEventListener('click', (e) => {
                // 노드 클릭이 아닌 경우에만 비활성화
                if (!e.target.closest('.story-node')) {
                    this.editorState.setActiveNode(null);
                    if (this.viewRenderer.renderNodes) this.viewRenderer.renderNodes();
                }
            });
        }
        // 핸들 드래그 시작
        nodeCanvas.addEventListener('mousedown', (e) => {
            // 선택지 핸들 드래그 시작
            if (
                e.target.classList.contains('next-link-handle') &&
                e.target.hasAttribute('data-choice-idx') &&
                e.target.hasAttribute('data-node-id')
            ) {
                const nodeId = e.target.getAttribute('data-node-id');
                const choiceIdx = parseInt(e.target.getAttribute('data-choice-idx'), 10);
                const node = this.nodeManager.getNodeById(nodeId);
                if (!node || node.type !== 'choice' || !Array.isArray(node.choices) || !node.choices[choiceIdx]) return;
                // 이미 연결되어 있으면 드래그 금지(원한다면 덮어쓰기 가능)
                if (node.choices[choiceIdx].next) return;
                handleDragState = {
                    fromNodeId: nodeId,
                    fromChoiceIdx: choiceIdx,
                    startX: e.clientX,
                    startY: e.clientY,
                    dragging: false,
                    isChoice: true
                };
                document.body.style.cursor = 'crosshair';
                e.preventDefault();
                return;
            }
            // 본문 핸들 드래그 시작
            if (e.target.classList.contains('next-link-handle')) {
                const nodeDiv = e.target.closest('.story-node');
                if (!nodeDiv) return;
                const nodeId = nodeDiv.getAttribute('data-id');
                const node = this.nodeManager.getNodeById(nodeId);
                if (!node || node.type !== 'text' || node.next) return;
                handleDragState = {
                    fromNodeId: nodeId,
                    startX: e.clientX,
                    startY: e.clientY,
                    dragging: false,
                    isChoice: false
                };
                document.body.style.cursor = 'crosshair';
                e.preventDefault();
            }
        });
        // 핸들 드래그 중 연결선 프리뷰
        window.addEventListener('mousemove', (e) => {
            if (!handleDragState) return;
            // 드래그 거리 임계값 이상이면 드래그로 간주
            if (!handleDragState.dragging && (Math.abs(e.clientX - handleDragState.startX) > 3 || Math.abs(e.clientY - handleDragState.startY) > 3)) {
                handleDragState.dragging = true;
            }
            // 연결선 프리뷰 SVG
            const nodeCanvas = document.getElementById('node-canvas');
            let previewSvg = nodeCanvas.querySelector('svg.handle-link-preview');
            if (!previewSvg) {
                previewSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                previewSvg.classList.add('handle-link-preview');
                previewSvg.style.position = 'absolute';
                previewSvg.style.left = '0';
                previewSvg.style.top = '0';
                previewSvg.style.width = '100%';
                previewSvg.style.height = '100%';
                previewSvg.style.pointerEvents = 'none';
                nodeCanvas.appendChild(previewSvg);
            }
            previewSvg.innerHTML = '';
            // from: 핸들 오른쪽 중앙
            let fromDiv, handle, handleRect;
            if (handleDragState.isChoice) {
                fromDiv = nodeCanvas.querySelector(`.story-node[data-id="${handleDragState.fromNodeId}"]`);
                const choiceRows = fromDiv ? fromDiv.querySelectorAll('.choice-row') : null;
                const row = choiceRows ? choiceRows[handleDragState.fromChoiceIdx] : null;
                handle = row ? row.querySelector('.next-link-handle') : null;
                handleRect = handle ? handle.getBoundingClientRect() : (row ? row.getBoundingClientRect() : fromDiv.getBoundingClientRect());
            } else {
                fromDiv = nodeCanvas.querySelector(`.story-node[data-id="${handleDragState.fromNodeId}"]`);
                handle = fromDiv && fromDiv.querySelector('.next-link-handle');
                handleRect = handle ? handle.getBoundingClientRect() : fromDiv.getBoundingClientRect();
            }
            const canvasRect = nodeCanvas.getBoundingClientRect();
            const startX = handleRect.right - canvasRect.left;
            const startY = (handleRect.top + handleRect.bottom) / 2 - canvasRect.top;
            // to: 마우스 위치
            const endX = e.clientX - canvasRect.left;
            const endY = e.clientY - canvasRect.top;
            const deltaX = Math.max(40, Math.abs(endX - startX) / 2);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d',
                `M${startX},${startY} C${startX + deltaX},${startY} ${endX - deltaX},${endY} ${endX},${endY}`
            );
            path.setAttribute('stroke', '#3949ab');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0.5');
            previewSvg.appendChild(path);
        });
        // 핸들 드래그 종료(드롭)
        window.addEventListener('mouseup', (e) => {
            if (!handleDragState) return;
            document.body.style.cursor = '';
            const nodeCanvas = document.getElementById('node-canvas');
            const previewSvg = nodeCanvas.querySelector('svg.handle-link-preview');
            if (previewSvg) previewSvg.remove();
            // 드래그가 아닌 클릭(즉시 생성)
            if (!handleDragState.dragging) {
                if (handleDragState.isChoice) {
                    // 선택지 핸들 클릭 시 바로 생성
                    const node = this.nodeManager.getNodeById(handleDragState.fromNodeId);
                    const choiceIdx = handleDragState.fromChoiceIdx;
                    if (node && node.type === 'choice' && node.choices && node.choices[choiceIdx] && !node.choices[choiceIdx].next) {
                        const newNodeId = this.nodeManager.generateNodeId();
                        const newNode = {
                            id: newNodeId,
                            name: '',
                            type: 'text',
                            content: '',
                            x: (node.x || 0) + 300,
                            y: (node.y || 0) + 80 * (choiceIdx + 1),
                            next: ''
                        };
                        this.nodeManager.addNode(newNode);
                        this.nodeManager.connectNode(node.id, newNodeId, { choiceIdx });
                        this.editorState.setActiveNode(newNodeId);
                        this.viewRenderer.renderNodes();
                    }
                } else {
                    // 기존 본문 핸들 클릭 동작
                    const fromNodeId = handleDragState.fromNodeId;
                    const node = this.nodeManager.getNodeById(fromNodeId);
                    if (node && node.type === 'text' && !node.next) {
                        const newNode = this.nodeManager.addNodeAfter(fromNodeId, '본문');
                        if (newNode) {
                            this.editorState.setActiveNode(newNode.id);
                            this.viewRenderer.renderNodes();
                        }
                    }
                }
                handleDragState = null;
                return;
            }
            // 드래그로 놓은 경우: 마우스 위치에 새 노드 생성
            if (handleDragState.isChoice) {
                const node = this.nodeManager.getNodeById(handleDragState.fromNodeId);
                const choiceIdx = handleDragState.fromChoiceIdx;
                if (node && node.type === 'choice' && node.choices && node.choices[choiceIdx] && !node.choices[choiceIdx].next) {
                    const nodeCanvasRect = nodeCanvas.getBoundingClientRect();
                    const dropX = e.clientX - nodeCanvasRect.left;
                    const dropY = e.clientY - nodeCanvasRect.top;
                    const newNodeId = this.nodeManager.generateNodeId();
                    const newNode = {
                        id: newNodeId,
                        name: '',
                        type: 'text',
                        content: '',
                        x: dropX - 110,
                        y: dropY - 50,
                        next: ''
                    };
                    this.nodeManager.addNode(newNode);
                    this.nodeManager.connectNode(node.id, newNodeId, { choiceIdx });
                    this.editorState.setActiveNode(newNodeId);
                    this.viewRenderer.renderNodes();
                }
            } else {
                // 기존 본문 핸들 드래그 동작
                const fromNodeId = handleDragState.fromNodeId;
                const node = this.nodeManager.getNodeById(fromNodeId);
                if (node && node.type === 'text' && !node.next) {
                    const nodeCanvasRect = nodeCanvas.getBoundingClientRect();
                    const dropX = e.clientX - nodeCanvasRect.left;
                    const dropY = e.clientY - nodeCanvasRect.top;
                    // 새 노드 생성 및 연결
                    const newNode = this.nodeManager.addNodeAfter(fromNodeId, '본문');
                    if (newNode) {
                        // 위치 지정
                        this.nodeManager.moveNode(newNode.id, dropX - 110, dropY - 50);
                        this.editorState.setActiveNode(newNode.id);
                        this.viewRenderer.renderNodes();
                    }
                }
            }
            handleDragState = null;
        });
        // 노드 오른쪽 클릭 시 편집 다이얼로그
        nodeCanvas.addEventListener('contextmenu', (e) => {
            const nodeDiv = e.target.closest('.story-node');
            if (!nodeDiv) return;
            const nodeId = nodeDiv.getAttribute('data-id');
            e.preventDefault(); // 항상 먼저 호출
            if (nodeId === 'start') return; // 시작 노드는 편집 금지
            this.nodeDialogManager.openDialog(nodeId);
        });
        // delete 키로 활성 노드 삭제
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Delete' && e.key !== 'Del') return;
            const activeNode = this.editorState.getActiveNode && this.editorState.getActiveNode();
            if (!activeNode) return;
            if (activeNode.id === 'start') return; // 시작 노드는 삭제 금지
            this.nodeManager.removeNode(activeNode.id);
            this.editorState.setActiveNode(null);
            this.viewRenderer.renderNodes();
        });
    }
    /**
     * 시작 노드로 이동 버튼 이벤트 바인딩
     */
    bindMoveToStartBtn() {
        const btn = document.getElementById('move-to-start-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const nodes = this.nodeManager.getAllNodes();
            if (!nodes || nodes.length === 0) return;
            // id가 'start'인 노드 우선, 없으면 첫 번째 노드
            let startNode = nodes.find(n => n.id === 'start');
            if (!startNode) startNode = nodes[0];
            if (!startNode) return;
            const sheetWrapper = document.getElementById('sheet-wrapper');
            const nodeCanvas = document.getElementById('node-canvas');
            if (!sheetWrapper || !nodeCanvas) return;
            // 노드 좌표(x, y)와 wrapper 크기 고려하여 스크롤 이동
            const nodeX = startNode.x || 0;
            const nodeY = startNode.y || 0;
            // wrapper 중앙에 노드가 오도록 스크롤 계산
            const wrapperW = sheetWrapper.clientWidth;
            const wrapperH = sheetWrapper.clientHeight;
            const scrollLeft = Math.max(0, nodeX - wrapperW / 2 + 100); // 100은 노드 크기 보정
            const scrollTop = Math.max(0, nodeY - wrapperH / 2 + 40);
            sheetWrapper.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
        });
    }
    /**
     * 단축키(1,2,3)로 노드 추가 이벤트 바인딩
     */
    bindShortcutAddNodeEvents() {
        document.addEventListener('keydown', (e) => {
            // 입력 포커스가 인풋, 텍스트에어리어, 컨텐츠에디터블이면 무시
            const tag = document.activeElement && document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
            let type = null;
            if (e.key === '1') type = '본문';
            if (e.key === '2') type = '선택지';
            if (e.key === '3') type = '조건분기';
            if (!type) return;
            const activeNode = this.editorState.getActiveNode && this.editorState.getActiveNode();
            if (!activeNode) return;
            const newNode = this.nodeManager.addNodeAfter(activeNode.id, type);
            if (newNode) {
                this.editorState.setActiveNode(newNode.id);
                this.viewRenderer.renderNodes();
            }
        });
    }
}
