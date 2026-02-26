document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소들을 JavaScript 변수로 가져옵니다.
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutLink = document.getElementById('logout-link');
    const welcomeMessage = document.getElementById('welcome-message');

    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const boardSection = document.getElementById('board-section');
    const postDetailSection = document.getElementById('post-detail-section');
    const postFormSection = document.getElementById('post-form-section');
    const editPostSection = document.getElementById('edit-post-section');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const newPostBtn = document.getElementById('new-post-btn');
    const postForm = document.getElementById('post-form');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const editPostBtn = document.getElementById('edit-post-btn');
    const deletePostBtn = document.getElementById('delete-post-btn');
    const editForm = document.getElementById('edit-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const commentForm = document.getElementById('comment-form');

    // 애플리케이션 상태 변수
    let loggedInUser = null; // 현재 로그인한 사용자 정보
    // 로컬 스토리지에서 게시글 목록을 불러오거나, 없으면 빈 배열로 초기화합니다.
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    // 로컬 스토리지에서 사용자 목록을 불러오거나, 없으면 빈 배열로 초기화합니다.
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentPostId = null; // 현재 보고 있는 게시글의 ID

    // 모든 섹션을 숨기는 함수
    function hideAllSections() {
        loginSection.classList.add('hidden');
        signupSection.classList.add('hidden');
        boardSection.classList.add('hidden');
        postDetailSection.classList.add('hidden');
        postFormSection.classList.add('hidden');
        editPostSection.classList.add('hidden');
    }

    // 특정 섹션을 보여주는 함수 (다른 모든 섹션은 숨깁니다)
    function showSection(section) {
        hideAllSections();
        section.classList.remove('hidden');
    }

    // 네비게이션 바를 업데이트하는 함수 (로그인 상태에 따라 링크 변경)
    function updateNav() {
        if (loggedInUser) {
            // 로그인 상태: 로그인/회원가입 링크 숨기고, 로그아웃 링크와 환영 메시지 표시
            loginLink.style.display = 'none';
            signupLink.style.display = 'none';
            logoutLink.style.display = 'inline';
            welcomeMessage.style.display = 'inline';
            welcomeMessage.textContent = `${loggedInUser.username}님 환영합니다!`;
            commentForm.classList.remove('hidden'); // 로그인하면 댓글 작성 폼 보이기
        } else {
            // 로그아웃 상태: 로그인/회원가입 링크 표시하고, 로그아웃 링크와 환영 메시지 숨김
            loginLink.style.display = 'inline';
            signupLink.style.display = 'inline';
            logoutLink.style.display = 'none';
            welcomeMessage.style.display = 'none';
            commentForm.classList.add('hidden'); // 로그아웃하면 댓글 작성 폼 숨기기
        }
    }

    // 사용자 인증 관련 함수 (로컬 스토리지 사용)

    // 사용자 회원가입 함수
    function registerUser(username, password) {
        if (users.some(user => user.username === username)) {
            alert('이미 존재하는 사용자 이름입니다.');
            return false;
        }
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users)); // 로컬 스토리지에 사용자 정보 저장
        alert('회원가입이 완료되었습니다.');
        return true;
    }

    // 사용자 로그인 함수
    function loginUser(username, password) {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            loggedInUser = user; // 로그인한 사용자 정보 저장
            alert(`${username}님 환영합니다!`);
            updateNav(); // 네비게이션 업데이트
            showSection(boardSection); // 게시판 섹션 보여주기
            renderPosts(); // 게시글 목록 렌더링
            return true;
        } else {
            alert('사용자 이름 또는 비밀번호가 올바르지 않습니다.');
            return false;
        }
    }

    // 사용자 로그아웃 함수
    function logoutUser() {
        loggedInUser = null; // 로그인 정보 초기화
        alert('로그아웃 되었습니다.');
        updateNav(); // 네비게이션 업데이트
        showSection(boardSection); // 게시판 섹션 보여주기
        renderPosts(); // 게시글 목록 렌더링
    }

    // 게시글 관련 함수 (로컬 스토리지 사용)

    // 게시글 목록을 렌더링하는 함수
    function renderPosts() {
        const postList = document.getElementById('post-list');
        postList.innerHTML = ''; // 기존 목록 초기화
        // 게시글을 최신순으로 정렬하여 표시
        posts.sort((a, b) => b.id - a.id).forEach(post => {
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <h3 data-id="${post.id}">${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <p><small>작성자: ${post.author} | ${new Date(post.timestamp).toLocaleString()}</small></p>
            `;
            postList.appendChild(postElement);
        });
    }

    // 다음 게시글 ID를 생성하는 함수
    function getNextPostId() {
        return posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    }

    // 새 게시글을 생성하는 함수
    function createPost(title, content) {
        const newPost = {
            id: getNextPostId(),
            title,
            content,
            author: loggedInUser.username,
            timestamp: Date.now(),
            comments: [] // 새 게시글에는 빈 댓글 배열 추가
        };
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts)); // 로컬 스토리지에 저장
        renderPosts(); // 게시글 목록 다시 렌더링
        showSection(boardSection); // 게시판 섹션으로 이동
    }

    // 게시글 상세 정보를 보여주는 함수
    function viewPost(id) {
        const post = posts.find(p => p.id === id);
        if (post) {
            currentPostId = id; // 현재 게시글 ID 저장
            document.getElementById('post-detail-title').textContent = post.title;
            document.getElementById('post-detail-content').textContent = post.content;
            document.getElementById('post-detail-author').textContent = post.author;

            // 작성자만 수정/삭제 버튼 보이게 처리
            if (loggedInUser && loggedInUser.username === post.author) {
                editPostBtn.classList.remove('hidden');
                deletePostBtn.classList.remove('hidden');
            } else {
                editPostBtn.classList.add('hidden');
                deletePostBtn.classList.add('hidden');
            }

            renderComments(post.comments); // 댓글 렌더링
            showSection(postDetailSection); // 게시글 상세 섹션 보여주기
        }
    }

    // 게시글을 업데이트하는 함수
    function updatePost(id, newTitle, newContent) {
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex > -1) {
            posts[postIndex].title = newTitle;
            posts[postIndex].content = newContent;
            localStorage.setItem('posts', JSON.stringify(posts)); // 로컬 스토리지에 저장
            renderPosts(); // 게시글 목록 다시 렌더링
            viewPost(id); // 수정 후 상세 페이지로 이동
        }
    }

    // 게시글을 삭제하는 함수
    function deletePost(id) {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            posts = posts.filter(p => p.id !== id);
            localStorage.setItem('posts', JSON.stringify(posts)); // 로컬 스토리지에 저장
            renderPosts(); // 게시글 목록 다시 렌더링
            showSection(boardSection); // 게시판 섹션으로 이동
        }
    }

    // 댓글 관련 함수

    // 댓글 목록을 렌더링하는 함수
    function renderComments(comments) {
        const commentList = document.getElementById('comment-list');
        commentList.innerHTML = ''; // 기존 댓글 목록 초기화
        if (comments.length === 0) {
            commentList.innerHTML = '<p>아직 댓글이 없습니다.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.innerHTML = `
                <p><strong>${comment.author}</strong>: ${comment.content}</p>
                <p><small>${new Date(comment.timestamp).toLocaleString()}</small></p>
            `;
            commentList.appendChild(commentElement);
        });
    }

    // 댓글을 추가하는 함수
    function addComment(postId, content) {
        const post = posts.find(p => p.id === postId);
        if (post && loggedInUser) { // 게시글이 존재하고 로그인 상태일 때만 댓글 추가 가능
            const newComment = {
                author: loggedInUser.username,
                content,
                timestamp: Date.now()
            };
            post.comments.push(newComment);
            localStorage.setItem('posts', JSON.stringify(posts)); // 로컬 스토리지에 저장
            renderComments(post.comments); // 댓글 다시 렌더링
        }
    }

    // 이벤트 리스너

    // 로그인 링크 클릭 시 로그인 섹션 보여주기
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection);
    });

    // 회원가입 링크 클릭 시 회원가입 섹션 보여주기
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(signupSection);
    });

    // 로그아웃 링크 클릭 시 로그아웃 처리
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });

    // 로그인 폼 제출 시 로그인 처리
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        loginUser(username, password);
        loginForm.reset(); // 폼 초기화
    });

    // 회원가입 폼 제출 시 회원가입 처리
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        if (registerUser(username, password)) {
            showSection(loginSection); // 회원가입 성공 후 로그인 화면으로 이동
        }
        signupForm.reset(); // 폼 초기화
    });

    // 새 글 작성 버튼 클릭 시 새 글 작성 섹션 보여주기
    newPostBtn.addEventListener('click', () => {
        if (loggedInUser) {
            showSection(postFormSection);
            document.getElementById('post-form').reset(); // 폼 초기화
        } else {
            alert('로그인 후 이용해주세요.');
            showSection(loginSection);
        }
    });

    // 게시글 작성 폼 제출 시 게시글 생성
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        if (title && content) {
            createPost(title, content);
        }
    });

    // 게시글 작성 취소 버튼 클릭 시 게시판 섹션으로 이동
    cancelPostBtn.addEventListener('click', () => {
        showSection(boardSection);
    });

    // 게시글 목록에서 제목 클릭 시 게시글 상세 보기
    document.getElementById('post-list').addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            const postId = parseInt(e.target.dataset.id);
            viewPost(postId);
        }
    });

    // 게시글 상세에서 목록으로 버튼 클릭 시 게시판 섹션으로 이동
    backToListBtn.addEventListener('click', () => {
        showSection(boardSection);
        renderPosts(); // 게시글 목록 다시 렌더링
    });

    // 게시글 수정 버튼 클릭 시 수정 폼 보여주기
    editPostBtn.addEventListener('click', () => {
        const post = posts.find(p => p.id === currentPostId);
        if (post) {
            document.getElementById('edit-post-id').value = post.id;
            document.getElementById('edit-post-title').value = post.title;
            document.getElementById('edit-post-content').value = post.content;
            showSection(editPostSection);
        }
    });

    // 게시글 삭제 버튼 클릭 시 게시글 삭제
    deletePostBtn.addEventListener('click', () => {
        if (currentPostId) {
            deletePost(currentPostId);
        }
    });

    // 게시글 수정 폼 제출 시 게시글 업데이트
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const postId = parseInt(document.getElementById('edit-post-id').value);
        const newTitle = document.getElementById('edit-post-title').value;
        const newContent = document.getElementById('edit-post-content').value;
        if (postId && newTitle && newContent) {
            updatePost(postId, newTitle, newContent);
        }
    });

    // 게시글 수정 취소 버튼 클릭 시 상세 페이지로 돌아가기
    cancelEditBtn.addEventListener('click', () => {
        viewPost(currentPostId);
    });

    // 댓글 작성 폼 제출 시 댓글 추가
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentContent = document.getElementById('comment-content').value;
        if (currentPostId && commentContent) {
            addComment(currentPostId, commentContent);
            document.getElementById('comment-content').value = ''; // 댓글 입력 필드 초기화
        }
    });


    // 초기 로드 시 실행될 함수들
    updateNav(); // 네비게이션 바 초기 업데이트
    showSection(boardSection); // 기본으로 게시판 섹션 보여주기
    renderPosts(); // 게시글 목록 초기 렌더링
});
