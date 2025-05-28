// 메인 페이지(index.html) 전용 스크립트
// 소설 리스트를 외부 JSON에서 불러와 렌더링
document.addEventListener('DOMContentLoaded', loadNovelList);

async function loadNovelList() {
    const list = document.querySelector('.novel-list ul');
    if (!list) return;
    try {
        const response = await fetch('novels/list.json');
        if (!response.ok) throw new Error('Failed to load novel list');

        const novels = await response.json();
        list.innerHTML = novels.map(novel => `
            <li>
                <a class="novel-link thumbnail-bg" href="${novel.link}" style="background-image:url('${novel.thumbnail}')">
                    ${novel.title}
                    <div class="novel-meta">장르: ${novel.genre}</div>
                </a>
            </li>
        `).join('');
    }
    catch (error) {
        console.error('Error loading novel list:', error);
        list.innerHTML = '<li>소설 목록을 불러오는 데 실패했습니다.</li>';
    }
}