/**
 * PositionUtil: 좌표 변환, 노드 위치 계산 등 위치 관련 유틸리티
 */
export const PositionUtil = {
    /**
     * 화면 좌표(clientX, clientY) → 캔버스 좌표 변환
     */
    toCanvasCoords(clientX, clientY, canvasRect) {
        return {
            x: clientX - canvasRect.left,
            y: clientY - canvasRect.top
        };
    },
    /**
     * 노드의 중앙 좌표 계산
     */
    getNodeCenter(node) {
        const width = 220; // 노드 기본 너비
        const height = 100; // 노드 기본 높이
        return {
            x: (node.x || 0) + width / 2,
            y: (node.y || 0) + height / 2
        };
    }
    // ...기타 위치 관련 함수 추가 가능...
};
