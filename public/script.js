// script.js - 브라우저에서 실행되는 코드

// DOM(HTML)이 모두 로드되었을 때 실행될 함수
document.addEventListener('DOMContentLoaded', () => {

    // 필요한 HTML 요소들을 가져옵니다.
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const fileListBody = document.getElementById('file-list-body');

    // --- 1. 파일 목록을 서버에서 가져와서 테이블을 채우는 함수 ---
    async function fetchFiles() {
        try {
            // 우리 API (GET /list) 호출
            const response = await fetch('/list');
            if (!response.ok) throw new Error('Failed to fetch files');
            
            const files = await response.json();

            // 테이블 본문(tbody)을 초기화
            fileListBody.innerHTML = '';

            // 각 파일을 순회하며 테이블 행(tr)을 추가
            files.forEach(file => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${file.id}</td>
                    <td>${file.original_filename}</td>
                    <td>
                        <a href="/download/${file.id}" class="button btn-download">다운로드</a>
                        <a href="/stream/${file.id}" target="_blank" class="button btn-stream">스트리밍</a>
                        <button class="button btn-rename" data-id="${file.id}">이름 변경</button>
                        <button class="button btn-delete" data-id="${file.id}">삭제</button>
                    </td>
                `;
                fileListBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Error fetching files:', error);
            fileListBody.innerHTML = '<tr><td colspan="3">파일 목록을 불러오는 데 실패했습니다.</td></tr>';
        }
    }

    // --- 2. 업로드 폼 제출(submit) 이벤트 처리 ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const file = fileInput.files[0];
        if (!file) {
            alert('파일을 선택하세요.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file); 

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            
            alert('업로드 성공!');
            fileInput.value = ''; 
            fetchFiles(); 

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('업로드에 실패했습니다.');
        }
    });

    // --- 3. 버튼 클릭 이벤트 처리 (이벤트 위임) ---
    fileListBody.addEventListener('click', async (e) => {
        
        const button = e.target;
        
        // --- (A) 삭제 버튼 로직 ---
        if (button.classList.contains('btn-delete')) {
            const fileId = button.dataset.id; 
            if (!confirm(`파일 ID ${fileId}를 정말 삭제하시겠습니까?`)) {
                return;
            }
            try {
                const response = await fetch(`/file/${fileId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Delete failed');
                alert('삭제되었습니다.');
                fetchFiles(); 
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('삭제에 실패했습니다.');
            }
        }

        // --- (B) 이름 변경 버튼 로직 ---
        if (button.classList.contains('btn-rename')) {
            const fileId = button.dataset.id;
            
            const newName = prompt('새 파일 이름을 입력하세요:');
            
            if (!newName) return; 

            try {
                const response = await fetch(`/file/${fileId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        original_filename: newName
                    })
                });

                if (!response.ok) throw new Error('Rename failed');
                
                alert('이름이 변경되었습니다.');
                fetchFiles(); 

            } catch (error) {
                console.error('Error renaming file:', error);
                alert('이름 변경에 실패했습니다.');
            }
        }
    });

    // --- 4. 페이지가 처음 로드될 때 파일 목록을 가져옵니다 ---
    fetchFiles();
});