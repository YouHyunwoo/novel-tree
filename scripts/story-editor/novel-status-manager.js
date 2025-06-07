// NovelStatusManager: 소설 상태 변수(신뢰도, 플래그 등) 관리
/**
 * 소설 상태 변수(이름, 유형, 초기값 등) 관리 클래스
 * - name: string
 * - type: 'number' | 'boolean'
 * - initial: number | boolean
 */
export class NovelStatusManager {
    constructor(editorState) {
        this.editorState = editorState;
    }
    /**
     * 상태 변수 추가
     * @param {{name: string, type: string, initial: any}} status
     * @returns {boolean} 성공 여부
     */
    addStatus(status) {
        if (!status || !status.name || !this.isValidType(status.type)) return false;
        if (this.isNameDuplicated(status.name)) return false;
        const list = this.editorState.getStatusList();
        list.push({
            name: status.name,
            type: status.type,
            initial: this.parseInitialValue(status.initial, status.type)
        });
        this.editorState.setStatusList(list);
        return true;
    }
    /**
     * 상태 변수 삭제
     */
    removeStatus(statusName) {
        let list = this.editorState.getStatusList();
        list = list.filter(s => s.name !== statusName);
        this.editorState.setStatusList(list);
    }
    /**
     * 상태 변수 수정
     */
    updateStatus(statusName, patch) {
        const list = this.editorState.getStatusList();
        const idx = list.findIndex(s => s.name === statusName);
        if (idx !== -1) {
            const updated = { ...list[idx], ...patch };
            if (patch.initial !== undefined) {
                updated.initial = this.parseInitialValue(patch.initial, updated.type);
            }
            list[idx] = updated;
            this.editorState.setStatusList(list);
        }
    }
    /**
     * 상태 변수 조회
     */
    getStatusByName(statusName) {
        return this.editorState.getStatusList().find(s => s.name === statusName) || null;
    }
    getAllStatus() {
        return this.editorState.getStatusList();
    }
    /**
     * 이름 중복 검사
     */
    isNameDuplicated(name) {
        return this.editorState.getStatusList().some(s => s.name === name);
    }
    /**
     * 타입 유효성 검사
     */
    isValidType(type) {
        return type === 'number' || type === 'boolean';
    }
    /**
     * 초기값 파싱 및 타입 변환
     */
    parseInitialValue(value, type) {
        if (type === 'number') {
            const num = Number(value);
            return isNaN(num) ? 0 : num;
        } else if (type === 'boolean') {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
                return value === 'true' || value === '1';
            }
            return Boolean(value);
        }
        return value;
    }
}
