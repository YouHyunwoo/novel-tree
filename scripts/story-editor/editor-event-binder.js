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
     * 노드 패널(노드 더블클릭 등) 이벤트 바인딩
     */
    bindNodePanelEvents() {
        const nodeCanvas = document.getElementById('node-canvas');
        if (!nodeCanvas) return;
        nodeCanvas.addEventListener('dblclick', (e) => {
            const nodeDiv = e.target.closest('.story-node');
            if (!nodeDiv) return;
            const nodeId = nodeDiv.textContent;
            this.nodeDialogManager.openDialog(nodeId);
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
}
