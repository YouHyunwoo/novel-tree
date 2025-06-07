// StatusEditDialogManager: 상태 변수 편집 다이얼로그 관리
/**
 * 상태 변수 편집 다이얼로그 관리 클래스
 */
export class StatusEditDialogManager {
    constructor(editorState, statusManager) {
        this.editorState = editorState;
        this.statusManager = statusManager;
        this.dialog = null;
        this.currentStatusName = null;
        this.isEdit = false;
    }
    /**
     * 상태 변수 편집/추가 다이얼로그 열기
     * @param {string|null} statusName - null이면 추가, 아니면 편집
     */
    openDialog(statusName = null) {
        this.currentStatusName = statusName;
        this.isEdit = !!statusName;
        let dialog = document.getElementById('status-edit-dialog');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'status-edit-dialog';
            dialog.innerHTML = `
                <form method="dialog" class="status-edit-form">
                    <label>이름 <input name="name" type="text" required></label><br>
                    <label>유형
                        <select name="type">
                            <option value="number">실수</option>
                            <option value="boolean">참거짓</option>
                        </select>
                    </label><br>
                    <label>초기값 <input name="initial" type="text"></label><br>
                    <menu>
                        <button value="cancel" type="button" class="cancel-btn">취소</button>
                        <button value="ok" type="submit">저장</button>
                    </menu>
                </form>
            `;
            document.body.appendChild(dialog);
        }
        this.dialog = dialog;
        // 값 채우기 (편집 시)
        if (this.isEdit) {
            const status = this.statusManager.getStatusByName(statusName);
            if (status) {
                dialog.querySelector('input[name="name"]').value = status.name;
                dialog.querySelector('input[name="name"]').disabled = true;
                dialog.querySelector('select[name="type"]').value = status.type;
                dialog.querySelector('select[name="type"]').disabled = true;
                dialog.querySelector('input[name="initial"]').value = status.initial;
            }
        } else {
            dialog.querySelector('input[name="name"]').value = '';
            dialog.querySelector('input[name="name"]').disabled = false;
            dialog.querySelector('select[name="type"]').value = 'number';
            dialog.querySelector('select[name="type"]').disabled = false;
            dialog.querySelector('input[name="initial"]').value = '';
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
        const initial = form.elements['initial'].value;
        if (!name) return;
        if (this.isEdit) {
            this.statusManager.updateStatus(name, { initial });
        } else {
            this.statusManager.addStatus({ name, type, initial });
        }
        this.closeDialog();
    }
}
