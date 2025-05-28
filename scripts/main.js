// 메인 페이지(index.html) 전용 스크립트
// 소설 리스트를 외부 JSON에서 불러와 렌더링
document.addEventListener('DOMContentLoaded', loadNovelList);

async function loadNovelList() {
    const list = document.querySelector('.novel-list ul');
    if (!list) return;
    try {
        const response = await fetch('novels/list.json');
        if (!response.ok) throw new Error('Failed to load novel list');

        const novelIds = await response.json();
        // 문자열 배열로 바로 사용
        const ids = Array.isArray(novelIds) ? novelIds : [];
        const novelInfos = await Promise.all(ids.map(async id => {
            try {
                const infoRes = await fetch(`novels/${id}/information.json`);
                if (!infoRes.ok) throw new Error();
                const info = await infoRes.json();
                return info;
            } catch {
                return null;
            }
        }));
        list.innerHTML = novelInfos.filter(Boolean).map(novel => {
            const hashtags = novel.genre
                .split(',')
                .map(tag => `#${tag.trim()}`)
                .join(' ');
            return `
                <li>
                    <a class="novel-link thumbnail-bg" href="novel.html?novel=${novel.id}" style="background-image:url('${novel.thumbnail}')">
                        <div class="novel-info">
                            <span class="novel-title">${novel.title}</span>
                            <div class="novel-bottom-row">
                                <div class="novel-meta">${hashtags}</div>
                                <span class="novel-author">${novel.author ? novel.author : ''}</span>
                            </div>
                        </div>
                    </a>
                </li>
            `;
        }).join('');
    }
    catch (error) {
        console.error('Error loading novel list:', error);
        list.innerHTML = '<li>소설 목록을 불러오는 데 실패했습니다.</li>';
    }
}