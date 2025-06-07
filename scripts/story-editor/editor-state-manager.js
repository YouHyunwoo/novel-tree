// EditorStateManager: 에디터 전체 상태(노드, 상태, 제목 등) 관리
// SOLID 원칙 준수
/**
 * 에디터 전체 상태를 관리하는 클래스
 * - 노드, 상태 변수, 제목, 선택된 노드 등
 * - 상태 변경 메서드 제공 (SOLID 원칙)
 */
export class EditorStateManager {
    /**
     * @constructor
     */
    constructor() {
        /** @type {Array} */
        this.nodes = [];
        /** @type {Array} */
        this.statusList = [];
        /** @type {string} */
        this.title = '';
        /** @type {string|null} */
        this.selectedNodeId = null;
    }
    getNodes() {
        return this.nodes;
    }
    setNodes(nodes) {
        this.nodes = Array.isArray(nodes) ? nodes : [];
    }
    getStatusList() {
        return this.statusList;
    }
    setStatusList(statusList) {
        this.statusList = Array.isArray(statusList) ? statusList : [];
    }
    getTitle() {
        return this.title;
    }
    setTitle(title) {
        this.title = title || '';
    }
    getSelectedNodeId() {
        return this.selectedNodeId;
    }
    setSelectedNodeId(nodeId) {
        this.selectedNodeId = nodeId;
    }
    reset() {
        this.nodes = [];
        this.statusList = [];
        this.title = '';
        this.selectedNodeId = null;
    }
}
