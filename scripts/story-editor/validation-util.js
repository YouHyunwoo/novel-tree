/**
 * ValidationUtil: 입력값, 데이터 구조 등 유효성 검사 유틸리티
 */
export const ValidationUtil = {
    /**
     * 비어있지 않은 문자열인지 검사
     * @param {any} str - 검사할 값
     * @returns {boolean} 비어있지 않은 문자열이면 true, 그렇지 않으면 false
     */
    isNonEmptyString(str) {
        return typeof str === 'string' && str.trim().length > 0;
    },

    /**
     * 유효한 상태 유형인지 검사
     * @param {any} type - 검사할 값
     * @returns {boolean} 유효한 상태 유형이면 true, 그렇지 않으면 false
     */
    isValidStatusType(type) {
        return type === 'number' || type === 'boolean';
    },

    /**
     * 유효한 숫자인지 검사
     * @param {any} val - 검사할 값
     * @returns {boolean} 유효한 숫자이면 true, 그렇지 않으면 false
     */
    isNumber(val) {
        return typeof val === 'number' && !isNaN(val);
    },

    /**
     * 유효한 불리언인지 검사
     * @param {any} val - 검사할 값
     * @returns {boolean} 유효한 불리언이면 true, 그렇지 않으면 false
     */
    isBoolean(val) {
        return typeof val === 'boolean';
    },

    /**
     * 유효한 노드인지 검사
     * @param {any} node - 검사할 값
     * @returns {boolean} 유효한 노드이면 true, 그렇지 않으면 false
     */
    isValidNode(node) {
        return node && typeof node.id === 'string' && typeof node.type === 'string';
    },

    /**
     * 유효한 상태인지 검사
     * @param {any} status - 검사할 값
     * @returns {boolean} 유효한 상태이면 true, 그렇지 않으면 false
     */
    isValidStatus(status) {
        return status && this.isNonEmptyString(status.name) && this.isValidStatusType(status.type);
    },

    // ...기타 유효성 검사 함수 추가 가능...
};
