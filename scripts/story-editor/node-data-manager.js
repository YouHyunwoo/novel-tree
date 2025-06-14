// NodeDataManager: 노드 데이터 CRUD 및 연결 관리
/**
 * 노드 데이터의 CRUD 및 연결, 탐색을 담당하는 클래스
 */
export class NodeDataManager {
    constructor(editorState) {
        this.editorState = editorState;
    }
    saveNodesToLocalStorage() {
        const nodes = this.editorState.getNodes();
        const title = this.editorState.getTitle();
        const data = { title, nodes };
        localStorage.setItem('novel-tree-nodes', JSON.stringify(data));
    }
    loadNodesFromLocalStorage() {
        const data = localStorage.getItem('novel-tree-nodes');
        if (!data) return null;
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                // 하위 호환: 노드 배열만 있을 때
                this.editorState.setNodes(parsed);
                this.editorState.setTitle('');
                return parsed;
            } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.nodes)) {
                this.editorState.setNodes(parsed.nodes);
                this.editorState.setTitle(parsed.title || '');
                return parsed.nodes;
            }
        } catch (e) {
            // 파싱 오류 무시
        }
        return null;
    }
    addNode(node) {
        const nodes = this.editorState.getNodes();
        nodes.push(node);
        this.editorState.setNodes(nodes);
        this.saveNodesToLocalStorage();
    }
    removeNode(nodeId) {
        // 연결 해제: 모든 노드의 next/choices/conditions에서 해당 id 제거
        this.disconnectNodeEverywhere(nodeId);
        let nodes = this.editorState.getNodes();
        nodes = nodes.filter(n => n.id !== nodeId);
        this.editorState.setNodes(nodes);
        this.saveNodesToLocalStorage();
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
            this.saveNodesToLocalStorage();
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
    /**
     * 활성 노드 다음에 새 노드를 추가하고 연결
     * @param {string} currentNodeId - 기준 노드 ID
     * @param {string} type - '본문'|'선택지'|'조건분기'
     * @returns {object|null} 새로 추가된 노드 객체
     */
    addNodeAfter(currentNodeId, type) {
        const typeMap = { '본문': 'text', '선택지': 'choice', '조건분기': 'condition' };
        const nodeType = typeMap[type];
        if (!nodeType) return null;
        const currentNode = this.getNodeById(currentNodeId);
        if (!currentNode) return null;
        const newNodeId = this.generateNodeId();
        const newNode = {
            id: newNodeId,
            name: '',
            type: nodeType,
            content: '',
            x: (currentNode.x || 0) + 300,
            y: currentNode.y || 0,
            next: ''
        };
        // 선택지/조건 분기 노드 초기 구조
        if (nodeType === 'choice') newNode.choices = [{ text: '', next: '' }];
        if (nodeType === 'condition') newNode.conditions = [{ expr: '', next: '' }];
        this.addNode(newNode);
        // 연결: 본문 노드면 next, 선택지/조건이면 기존 next/choices/conditions에 따라 연결
        if (currentNode.type === 'text') {
            this.connectNode(currentNodeId, newNodeId);
        } else if (currentNode.type === 'choice' && currentNode.choices && currentNode.choices.length > 0) {
            this.connectNode(currentNodeId, newNodeId, { choiceIdx: 0 });
        } else if (currentNode.type === 'condition' && currentNode.conditions && currentNode.conditions.length > 0) {
            this.connectNode(currentNodeId, newNodeId, { condIdx: 0 });
        }
        return newNode;
    }
    // 연결, 이동, 기타 유틸리티 메서드 추가 예정
}
