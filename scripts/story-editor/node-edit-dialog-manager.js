/**
 * 노드 편집 다이얼로그 관리 클래스
 */
export class NodeEditDialogManager {
    constructor(editorState, nodeManager, viewRenderer) {
        this.editorState = editorState;
        this.nodeManager = nodeManager;
        this.viewRenderer = viewRenderer;
        this.dialog = null;
        this.currentNodeId = null;
    }
    /**
     * 노드 편집 다이얼로그 열기
     */
    openDialog(nodeId) {
        this.currentNodeId = nodeId;
        // HTML에 선언된 dialog를 참조
        const dialog = document.getElementById('node-edit-dialog');
        if (!dialog) {
            alert('node-edit-dialog가 HTML에 선언되어 있지 않습니다.');
            return;
        }
        this.dialog = dialog;
        // 값 채우기
        const node = this.nodeManager.getNodeById(nodeId);
        if (node) {
            dialog.querySelector('input[name="name"]').value = node.name || '';
            dialog.querySelector('select[name="type"]').value = node.type;
        }
        // 동적 UI 렌더링 함수
        let renderDynamic = () => {
            const type = dialog.querySelector('select[name="type"]').value;
            const dynamicDiv = dialog.querySelector('.node-edit-dynamic');
            dynamicDiv.innerHTML = '';
            if (type === 'text') {
                // 본문 노드: 내용 textarea
                const label = document.createElement('label');
                label.textContent = '내용 ';
                const textarea = document.createElement('textarea');
                textarea.name = 'content';
                textarea.style.width = '100%';
                textarea.style.minHeight = '60px';
                textarea.style.marginTop = '4px';
                label.appendChild(textarea);
                dynamicDiv.appendChild(label);
                // 값 채우기
                if (node && node.type === 'text') {
                    textarea.value = node.content || '';
                }
            } else if (type === 'choice') {
                // 선택지 노드: 선택지 목록 UI
                const label = document.createElement('label');
                label.textContent = '선택지 목록';
                label.style.display = 'block';
                label.style.fontWeight = '600';
                label.style.marginBottom = '6px';
                dynamicDiv.appendChild(label);
                // 선택지 배열 상태
                let choices = (node && Array.isArray(node.choices)) ? node.choices.map(c => ({ ...c })) : [{ text: '' }];
                // 동적 목록 컨테이너
                const listDiv = document.createElement('div');
                listDiv.className = 'edit-choices-list';
                dynamicDiv.appendChild(listDiv);
                // 렌더 함수
                const renderChoices = () => {
                    listDiv.innerHTML = '';
                    choices.forEach((choice, idx) => {
                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.alignItems = 'center';
                        row.style.gap = '8px';
                        row.style.marginBottom = '4px';
                        // 선택지 입력
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = choice.text || '';
                        input.placeholder = `선택지 ${idx + 1}`;
                        input.style.flex = '1 1 auto';
                        input.oninput = (e) => {
                            choices[idx].text = e.target.value;
                        };
                        row.appendChild(input);
                        // 삭제 버튼
                        const delBtn = document.createElement('button');
                        delBtn.type = 'button';
                        delBtn.textContent = '삭제';
                        delBtn.style.marginLeft = '2px';
                        delBtn.onclick = () => {
                            choices.splice(idx, 1);
                            if (choices.length === 0) choices.push({ text: '' });
                            renderChoices();
                        };
                        row.appendChild(delBtn);
                        listDiv.appendChild(row);
                    });
                };
                renderChoices();
                // 선택지 추가 버튼
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.textContent = '+ 선택지 추가';
                addBtn.style.marginTop = '6px';
                addBtn.onclick = () => {
                    choices.push({ text: '' });
                    renderChoices();
                };
                dynamicDiv.appendChild(addBtn);
                // 저장 시 choices를 폼에 임시로 저장
                dialog.__editChoices = choices;
            } else {
                // 기타 유형(추후 확장)
                dynamicDiv.innerHTML = '';
            }
        };
        // 유형 변경 시 동적 UI 갱신
        dialog.querySelector('select[name="type"]').onchange = renderDynamic;
        renderDynamic();
        // --- 실시간 임시 저장 기능 추가 ---
        // 이름, 유형, 본문, 선택지 등 입력값 변경 시 localStorage에 즉시 저장
        const saveTemp = () => {
            // 현재 폼의 값으로 노드 patch 생성
            const form = dialog.querySelector('form');
            const name = form.elements['name'].value.trim();
            const type = form.elements['type'].value;
            let content = '';
            let choices = undefined;
            if (type === 'text') {
                content = form.elements['content'] ? form.elements['content'].value : '';
            } else if (type === 'choice') {
                // 선택지 배열을 저장
                choices = (dialog.__editChoices || []).map(c => ({ text: c.text || '', next: '' }));
            }
            if (!name) return; // 이름 없으면 저장 안 함
            const patch = { name, type };
            if (type === 'text') patch.content = content;
            if (type === 'choice') patch.choices = choices;
            this.nodeManager.updateNode(this.currentNodeId, patch);
        };
        // 이름, 유형, 본문 textarea, 선택지 input 등 변경 이벤트에 saveTemp 연결
        dialog.querySelector('input[name="name"]').addEventListener('input', saveTemp);
        dialog.querySelector('select[name="type"]').addEventListener('change', saveTemp);
        // 동적 UI 렌더링 후 본문 textarea/선택지 input에도 이벤트 연결
        const bindDynamicInputs = () => {
            const type = dialog.querySelector('select[name="type"]').value;
            if (type === 'text') {
                const textarea = dialog.querySelector('textarea[name="content"]');
                if (textarea) textarea.addEventListener('input', saveTemp);
            } else if (type === 'choice') {
                const inputs = dialog.querySelectorAll('.edit-choices-list input[type="text"]');
                inputs.forEach(input => input.addEventListener('input', saveTemp));
            }
        };
        // renderDynamic 호출 시마다 동적 입력 이벤트 바인딩
        const origRenderDynamic = renderDynamic;
        renderDynamic = () => {
            origRenderDynamic();
            bindDynamicInputs();
        };
        // 최초 1회 바인딩
        bindDynamicInputs();
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
        let content = '';
        let choices = undefined;
        if (type === 'text') {
            content = form.elements['content'].value;
        } else if (type === 'choice') {
            // 선택지 배열을 저장
            choices = (this.dialog.__editChoices || []).map(c => ({ text: c.text || '', next: '' }));
        }
        if (!name) return;
        const patch = { name, type };
        if (type === 'text') patch.content = content;
        if (type === 'choice') patch.choices = choices;
        this.nodeManager.updateNode(this.currentNodeId, patch);
        this.closeDialog();
        if (this.viewRenderer && this.viewRenderer.renderNodes) {
            this.viewRenderer.renderNodes();
        }
    }
}
