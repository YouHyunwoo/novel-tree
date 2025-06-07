/**
 * 노드 편집 다이얼로그 관리 클래스
 */
export class NodeEditDialogManager {
    constructor(editorState, nodeManager) {
        this.editorState = editorState;
        this.nodeManager = nodeManager;
        this.dialog = null;
        this.currentNodeId = null;
    }
    /**
     * 노드 편집 다이얼로그 열기
     */
    openDialog(nodeId) {
        this.currentNodeId = nodeId;
        let dialog = document.getElementById('node-edit-dialog');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'node-edit-dialog';
            dialog.innerHTML = `
                <form method="dialog" class="node-edit-form">
                    <label>이름 <input name="name" type="text" required></label><br>
                    <label>유형
                        <select name="type">
                            <option value="text">본문</option>
                            <option value="choice">선택지</option>
                            <option value="condition">조건</option>
                        </select>
                    </label><br>
                    <label>내용 <textarea name="content"></textarea></label><br>
                    <menu>
                        <button value="cancel" type="button" class="cancel-btn">취소</button>
                        <button value="ok" type="submit">저장</button>
                    </menu>
                </form>
            `;
            document.body.appendChild(dialog);
        }
        this.dialog = dialog;
        // 값 채우기
        const node = this.nodeManager.getNodeById(nodeId);
        if (node) {
            dialog.querySelector('input[name="name"]').value = node.name || '';
            dialog.querySelector('select[name="type"]').value = node.type;
            dialog.querySelector('textarea[name="content"]').value = node.content || '';
        }
        // 이벤트 바인딩
        dialog.querySelector('.cancel-btn').onclick = () => dialog.close();
        dialog.querySelector('form').onsubmit = (e) => {
            e.preventDefault();
            this.applyChanges();
        };
        dialog.showModal();
    }
    /**
     * 다이얼로그 닫기
     */
    closeDialog() {
        if (this.dialog) this.dialog.close();
    }
    /**
     * 입력값 검증 및 반영
     */
    applyChanges() {
        if (!this.dialog) return;
        const form = this.dialog.querySelector('form');
        const name = form.elements['name'].value.trim();
        const type = form.elements['type'].value;
        const content = form.elements['content'].value;
        if (!name) return;
        this.nodeManager.updateNode(this.currentNodeId, { name, type, content });
        this.closeDialog();
    }
}
