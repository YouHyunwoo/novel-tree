// NodeDataManager: 노드 데이터 CRUD 및 연결 관리
/**
 * 노드 데이터의 CRUD 및 연결, 탐색을 담당하는 클래스
 */
export class NodeDataManager {
    constructor(editorState) {
        this.editorState = editorState;
    }
    addNode(node) {
        const nodes = this.editorState.getNodes();
        nodes.push(node);
        this.editorState.setNodes(nodes);
    }
    removeNode(nodeId) {
        let nodes = this.editorState.getNodes();
        nodes = nodes.filter(n => n.id !== nodeId);
        this.editorState.setNodes(nodes);
    }
    getNodeById(nodeId) {
        return this.editorState.getNodes().find(n => n.id === nodeId) || null;
    }
    updateNode(nodeId, patch) {
        const nodes = this.editorState.getNodes();
        const idx = nodes.findIndex(n => n.id === nodeId);
        if (idx !== -1) {
            nodes[idx] = { ...nodes[idx], ...patch };
            this.editorState.setNodes(nodes);
        }
    }
    getAllNodes() {
        return this.editorState.getNodes();
    }
    /**
     * 노드 좌표 이동
     */
    moveNode(nodeId, x, y) {
        this.updateNode(nodeId, { x, y });
    }
    /**
     * 노드 연결(next, 선택지, 조건)
     */
    connectNode(fromId, toId, options = {}) {
        const node = this.getNodeById(fromId);
        if (!node) return;
        if (node.type === 'text') {
            this.updateNode(fromId, { next: toId });
        } else if (node.type === 'choice' && typeof options.choiceIdx === 'number') {
            const nodes = this.editorState.getNodes();
            const idx = nodes.findIndex(n => n.id === fromId);
            if (idx !== -1 && nodes[idx].choices && nodes[idx].choices[options.choiceIdx]) {
                nodes[idx].choices[options.choiceIdx].next = toId;
                this.editorState.setNodes(nodes);
            }
        } else if (node.type === 'condition' && typeof options.condIdx === 'number') {
            const nodes = this.editorState.getNodes();
            const idx = nodes.findIndex(n => n.id === fromId);
            if (idx !== -1 && nodes[idx].conditions && nodes[idx].conditions[options.condIdx]) {
                nodes[idx].conditions[options.condIdx].next = toId;
                this.editorState.setNodes(nodes);
            }
        }
    }
    /**
     * 노드 연결 해제(삭제 시 참조 제거)
     */
    disconnectNodeEverywhere(nodeId) {
        const nodes = this.editorState.getNodes();
        nodes.forEach(n => {
            if (n.next === nodeId) n.next = '';
            if (n.type === 'choice' && n.choices) {
                n.choices.forEach(choice => {
                    if (choice.next === nodeId) choice.next = '';
                });
            }
            if (n.type === 'condition' && n.conditions) {
                n.conditions.forEach(cond => {
                    if (cond.next === nodeId) cond.next = '';
                });
            }
        });
        this.editorState.setNodes(nodes);
    }
    /**
     * 노드 ID 중복 검사
     */
    isIdDuplicated(id) {
        return this.editorState.getNodes().some(n => n.id === id);
    }
    /**
     * 새 노드 ID 생성
     */
    generateNodeId() {
        let id;
        do {
            id = 'node_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        } while (this.isIdDuplicated(id));
        return id;
    }
    /**
     * 타입별 노드 유틸리티(본문/선택지/조건)
     */
    getNodesByType(type) {
        return this.editorState.getNodes().filter(n => n.type === type);
    }
    // 연결, 이동, 기타 유틸리티 메서드 추가 예정
}
