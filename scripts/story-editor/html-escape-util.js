/**
 * HTML 이스케이프 유틸리티 함수
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, s => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[s]);
}
