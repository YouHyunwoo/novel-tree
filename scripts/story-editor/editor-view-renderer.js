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
        nodes.forEach(node => {
            const div = document.createElement('div');
            div.className = 'story-node';
            div.style.left = (node.x || 0) + 'px';
            div.style.top = (node.y || 0) + 'px';
            div.textContent = node.name || node.id;
            nodeCanvas.appendChild(div);
        });
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
