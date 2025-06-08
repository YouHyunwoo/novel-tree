import { EditorStateManager } from './story-editor/editor-state-manager.js';
import { NodeDataManager } from './story-editor/node-data-manager.js';
import { NovelStatusManager } from './story-editor/novel-status-manager.js';
import { EditorViewRenderer } from './story-editor/editor-view-renderer.js';
import { NodeEditDialogManager } from './story-editor/node-edit-dialog-manager.js';
import { StatusEditDialogManager } from './story-editor/status-edit-dialog-manager.js';
import { EditorEventBinder } from './story-editor/editor-event-binder.js';
import { EditorStorageService } from './story-editor/editor-storage-service.js';

// 1. 상태 및 매니저 인스턴스 생성
const editorState = new EditorStateManager();
const nodeManager = new NodeDataManager(editorState);
const statusManager = new NovelStatusManager(editorState);
const viewRenderer = new EditorViewRenderer(editorState, nodeManager, statusManager);
const nodeDialogManager = new NodeEditDialogManager(editorState, nodeManager, viewRenderer);
const statusDialogManager = new StatusEditDialogManager(editorState, statusManager);
const eventBinder = new EditorEventBinder(
    editorState, nodeManager, statusManager, viewRenderer, nodeDialogManager, statusDialogManager
);
const storageService = new EditorStorageService(editorState);

// 2. 초기 렌더링 및 이벤트 바인딩
window.addEventListener('DOMContentLoaded', () => {
    // localStorage에 저장된 노드가 있으면 불러와서 반영
    const loaded = nodeManager.loadNodesFromLocalStorage();
    // 노드가 하나도 없으면 시작 노드 자동 생성
    if (!loaded || nodeManager.getAllNodes().length === 0) {
        nodeManager.addNode({
            id: 'start',
            name: '시작',
            type: 'text',
            content: '',
            x: 200,
            y: 120,
            next: ''
        });
    }
    viewRenderer.renderAll();
    eventBinder.bindAll();
    // 저장/불러오기 버튼 이벤트 연결
    const exportBtn = document.getElementById('export-nodes-btn');
    if (exportBtn) {
        exportBtn.onclick = () => storageService.exportToFile();
    }
    const importBtn = document.getElementById('import-nodes-btn');
    const importFile = document.getElementById('import-nodes-file');
    if (importBtn && importFile) {
        importBtn.onclick = () => importFile.click();
        importFile.onchange = (e) => {
            const file = e.target.files[0];
            storageService.importFromFile(file, () => {
                viewRenderer.renderAll();
            }, (errMsg) => {
                alert(errMsg);
            });
        };
    }
    // 소설 제목 입력 시 상태에 반영 + localStorage에 즉시 저장
    const titleInput = document.getElementById('novel-title-input');
    if (titleInput) {
        // 초기값 세팅 (localStorage나 파일에서 불러온 값)
        titleInput.value = editorState.getTitle() || '';
        titleInput.addEventListener('input', (e) => {
            editorState.setTitle(e.target.value);
            nodeManager.saveNodesToLocalStorage(); // 제목 변경 시 즉시 저장
        });
    }
});