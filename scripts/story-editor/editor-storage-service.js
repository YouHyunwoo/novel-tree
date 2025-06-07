/**
 * 저장/불러오기(Export/Import) 기능 담당 클래스
 */
export class EditorStorageService {
    constructor(editorState) {
        this.editorState = editorState;
    }
    /**
     * 에디터 상태를 파일로 내보내기
     */
    exportToFile() {
        const data = {
            title: this.editorState.getTitle(),
            nodes: this.editorState.getNodes(),
            statusList: this.editorState.getStatusList()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'novel-nodes.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    /**
     * 파일에서 에디터 상태 불러오기 (하위 호환 지원)
     */
    importFromFile(file, onSuccess, onError) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (Array.isArray(parsed)) {
                    // 하위 호환: 노드 배열만 있을 때
                    this.editorState.setNodes(parsed);
                    this.editorState.setStatusList([]);
                    this.editorState.setTitle('');
                } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.nodes)) {
                    this.editorState.setNodes(parsed.nodes);
                    this.editorState.setStatusList(Array.isArray(parsed.statusList) ? parsed.statusList : []);
                    this.editorState.setTitle(parsed.title || '');
                } else {
                    if (onError) onError('올바른 노드 데이터가 아닙니다.');
                    return;
                }
                if (onSuccess) onSuccess();
            } catch (err) {
                if (onError) onError('JSON 파싱 오류: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
}
